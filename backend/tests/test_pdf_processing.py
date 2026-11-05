import io
import pytest
import pymupdf
from fastapi.testclient import TestClient

from app.main import app
from app.services.pdf_service import parse_page_range, normalize_latex_delimiters, fix_escaped_newlines
from app.api.auth import create_access_token

client = TestClient(app)


def create_sample_pdf(num_pages: int = 2, with_math: bool = True) -> bytes:
    """Helper to generate an in-memory PDF with specified pages and math content."""
    doc = pymupdf.open()
    for i in range(num_pages):
        page = doc.new_page(width=612, height=792)
        if i == 0:
            text = (
                "Chapter 1: AC Circuit Fundamentals\n\n"
                "Alternating current sinusoidal voltage is defined as:\n"
                "V(t) = V_m * sin(\\omega t)\n"
                "where \\omega = 2\\pi f is the angular frequency.\n"
                "The characteristic equation of the circuit impedance satisfies det(A - \\lambda I) = 0."
            )
        elif i == 1:
            text = (
                "Chapter 2: Average and RMS Values\n\n"
                "The average voltage over a half-cycle is given by:\n"
                "\\boxed{V_{avg} = \\frac{2V_m}{\\pi}}\n\n"
                "The RMS voltage is V_{rms} = \\frac{V_m}{\\sqrt{2}}."
            )
        else:
            text = f"Chapter {i+1}: Additional Course Notes for Electrical Engineering."
        page.insert_text((50, 72), text)
    return doc.tobytes()


def test_fix_escaped_newlines():
    # Should convert literal \n into real newline while preserving \nabla and \nu
    raw = "Line 1\\nLine 2\\n\\nabla f = 0\\n\\nu is frequency"
    res = fix_escaped_newlines(raw)
    assert "Line 1\nLine 2\n" in res
    assert r"\nabla f = 0" in res
    assert r"\nu is frequency" in res


def test_normalize_latex_delimiters():
    raw = r"\boxed{V_{avg} = \frac{2V_m}{\pi}}"
    norm, has_math = normalize_latex_delimiters(raw)
    assert has_math is True
    assert r"\[" in norm or r"$$" in norm or r"\boxed" in norm

    inline_raw = r"where \omega = 2\pi f and \pi = 3.14"
    norm_inline, has_math_inline = normalize_latex_delimiters(inline_raw)
    assert has_math_inline is True
    assert r"\(" in norm_inline or "$" in norm_inline


def test_parse_page_range():
    assert parse_page_range("all", 5) == [0, 1, 2, 3, 4]
    assert parse_page_range("", 5) == [0, 1, 2, 3, 4]
    assert parse_page_range("1-3", 5) == [0, 1, 2]
    assert parse_page_range("2, 4", 5) == [1, 3]
    assert parse_page_range("1-2, 5", 5) == [0, 1, 4]
    assert parse_page_range("10-15", 5) == [0, 1, 2, 3, 4]  # invalid defaults to all


def test_upload_pdf_success():
    pdf_bytes = create_sample_pdf(num_pages=2)
    files = {"file": ("ac_circuits.pdf", pdf_bytes, "application/pdf")}
    data = {"page_range": "all"}

    response = client.post("/api/pdf/upload", files=files, data=data)
    assert response.status_code == 200
    res = response.json()

    assert res["doc_id"].startswith("pdf-")
    assert res["file_name"] == "ac_circuits.pdf"
    assert res["page_count"] == 2
    assert res["has_math"] is True
    assert len(res["pages"]) == 2
    assert "Chapter 1: AC Circuit Fundamentals" in res["extracted_markdown"]
    assert "V_{avg}" in res["extracted_markdown"]
    assert res["download_url"].startswith("/api/pdf/")
    assert res["markdown_download_url"].startswith("/api/pdf/")


def test_upload_pdf_with_page_range():
    pdf_bytes = create_sample_pdf(num_pages=3)
    files = {"file": ("three_pages.pdf", pdf_bytes, "application/pdf")}
    data = {"page_range": "2-3"}

    response = client.post("/api/pdf/upload", files=files, data=data)
    assert response.status_code == 200
    res = response.json()

    assert res["page_count"] == 3
    assert len(res["pages"]) == 2
    assert res["pages"][0]["page_number"] == 2
    assert res["pages"][1]["page_number"] == 3


def test_get_pdf_document():
    pdf_bytes = create_sample_pdf(num_pages=1)
    files = {"file": ("single_page.pdf", pdf_bytes, "application/pdf")}
    upload_res = client.post("/api/pdf/upload", files=files).json()
    doc_id = upload_res["doc_id"]

    get_res = client.get(f"/api/pdf/{doc_id}")
    assert get_res.status_code == 200
    doc = get_res.json()
    assert doc["doc_id"] == doc_id
    assert doc["file_name"] == "single_page.pdf"


def test_update_pdf_document():
    pdf_bytes = create_sample_pdf(num_pages=1)
    files = {"file": ("editable.pdf", pdf_bytes, "application/pdf")}
    doc_id = client.post("/api/pdf/upload", files=files).json()["doc_id"]

    update_payload = {
        "edited_markdown": "# Updated Topic Title\n\nNew custom notes content.",
        "subject": "Advanced Electrical Engineering",
        "topic": "Power Systems & Harmonics"
    }
    put_res = client.put(f"/api/pdf/{doc_id}", json=update_payload)
    assert put_res.status_code == 200
    updated = put_res.json()
    assert updated["subject"] == "Advanced Electrical Engineering"
    assert updated["topic"] == "Power Systems & Harmonics"
    assert "New custom notes content." in updated["extracted_markdown"]


def test_download_original_pdf():
    pdf_bytes = create_sample_pdf(num_pages=1)
    files = {"file": ("download_test.pdf", pdf_bytes, "application/pdf")}
    doc_id = client.post("/api/pdf/upload", files=files).json()["doc_id"]

    download_res = client.get(f"/api/pdf/{doc_id}/download")
    assert download_res.status_code == 200
    assert download_res.headers["content-type"] == "application/pdf"
    assert len(download_res.content) > 0


def test_download_converted_markdown():
    pdf_bytes = create_sample_pdf(num_pages=1)
    files = {"file": ("math_notes.pdf", pdf_bytes, "application/pdf")}
    doc_id = client.post("/api/pdf/upload", files=files).json()["doc_id"]

    md_res = client.get(f"/api/pdf/{doc_id}/markdown")
    assert md_res.status_code == 200
    assert "text/markdown" in md_res.headers["content-type"]
    text = md_res.text
    assert "# Math Notes" in text or "Chapter 1" in text


def test_pdf_history():
    pdf_bytes = create_sample_pdf(num_pages=1)
    files = {"file": ("history_test.pdf", pdf_bytes, "application/pdf")}
    client.post("/api/pdf/upload", files=files)

    hist_res = client.get("/api/pdf/history")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert isinstance(history, list)
    assert len(history) > 0
    assert any(h["file_name"] == "history_test.pdf" for h in history)


def test_invalid_pdf_rejected():
    files = {"file": ("corrupt.pdf", b"This is not a valid PDF binary content", "application/pdf")}
    res = client.post("/api/pdf/upload", files=files)
    assert res.status_code == 400
    assert "not a valid PDF" in res.json()["detail"]


def test_empty_pdf_rejected():
    empty_bytes = b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"
    files = {"file": ("empty.pdf", empty_bytes, "application/pdf")}
    res = client.post("/api/pdf/upload", files=files)
    assert res.status_code == 400
    assert "contains no pages" in res.json()["detail"]
