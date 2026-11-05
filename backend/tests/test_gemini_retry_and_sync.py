import io
import time
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.gemini_service import gemini_service
from app.schemas.scan import ScanResponse

client = TestClient(app)


def test_ping_endpoints():
    """Verify that both /ping and /api/ping respond immediately with status ok."""
    res1 = client.get("/ping")
    assert res1.status_code == 200
    assert res1.json().get("status") == "ok"

    res2 = client.get("/api/ping")
    assert res2.status_code == 200
    assert res2.json().get("status") == "ok"


def test_gemini_503_transient_retry_and_fallback():
    """
    Simulate primary model returning 503 UNAVAILABLE.
    Verify that _call_content_generation retries with backoff and falls back
    to the working secondary model seamlessly.
    """
    mock_genai_client = MagicMock()

    call_count = {"primary": 0, "fallback": 0}

    def fake_generate_content(model, contents, config=None):
        if "3.1-flash-lite" in model or "flash-lite-latest" in model:
            call_count["fallback"] += 1
            mock_resp = MagicMock()
            mock_resp.text = '{"text": "Sample text", "subject": "Engineering", "topic": "Calculus", "confidence": "High", "uncertain_segments": []}'
            return mock_resp
        else:
            call_count["primary"] += 1
            raise Exception("503 UNAVAILABLE. This model is currently experiencing high demand.")

    mock_genai_client.models.generate_content.side_effect = fake_generate_content

    with patch.object(gemini_service, "get_client", return_value=mock_genai_client):
        with patch("time.sleep", return_value=None):  # Fast execution in tests
            res = gemini_service._call_content_generation(
                contents=["Test prompt"]
            )
            assert res is not None
            # Primary model failed 3 times with 503, then fallback succeeded
            assert call_count["primary"] == 3
            assert call_count["fallback"] >= 1


def test_gemini_fatal_error_no_retries():
    """
    Simulate a 401 UNAUTHORIZED or invalid API key error.
    Verify that _call_content_generation fails fast immediately without wasting retries.
    """
    mock_genai_client = MagicMock()
    call_count = {"calls": 0}

    def fake_generate_content(model, contents, config=None):
        call_count["calls"] += 1
        raise Exception("401 API_KEY_INVALID. The provided API key is invalid.")

    mock_genai_client.models.generate_content.side_effect = fake_generate_content

    with patch.object(gemini_service, "get_client", return_value=mock_genai_client):
        with pytest.raises(Exception) as exc_info:
            gemini_service._call_content_generation(contents=["Test"])
        assert "API_KEY_INVALID" in str(exc_info.value)
        # Exactly 1 call, zero retries
        assert call_count["calls"] == 1


def test_upload_deduplication_on_retry():
    """
    Verify that uploading the exact same image content consecutively within cache TTL
    returns the cached result without duplicate processing or duplicate scan records.
    """
    # Create valid JPEG test image
    img = Image.new("RGB", (60, 60), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    # First upload
    response1 = client.post(
        "/api/scan",
        files={"file": ("test_dedup.jpg", img_bytes, "image/jpeg")},
        data={"subject_hint": "Signal Processing"}
    )
    assert response1.status_code == 200
    data1 = response1.json()
    scan_id_1 = data1["scan_id"]

    # Immediate second upload of identical image (simulated network retry)
    response2 = client.post(
        "/api/scan",
        files={"file": ("test_dedup.jpg", img_bytes, "image/jpeg")},
        data={"subject_hint": "Signal Processing"}
    )
    assert response2.status_code == 200
    data2 = response2.json()
    scan_id_2 = data2["scan_id"]

    # Deduplication ensures the exact same scan result is returned on retry
    assert scan_id_1 == scan_id_2
    assert data1["text"] == data2["text"]

