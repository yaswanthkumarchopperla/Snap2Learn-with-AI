import os
import re
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status, Response
from fastapi.responses import FileResponse

from app.core.config import settings
from app.schemas.pdf import (
    PdfProcessResponse,
    PdfUpdateRequest,
    PdfHistoryItem
)
from app.services.pdf_service import pdf_service
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/pdf", tags=["PDF Processing"])


@router.post("/upload", response_model=PdfProcessResponse)
async def upload_and_process_pdf(
    file: UploadFile = File(...),
    page_range: Optional[str] = Form("all"),
    subject_hint: Optional[str] = Form(None),
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Upload a multi-page PDF document, validate MIME type & size, extract text/tables,
    handle scanned pages via OCR, format mathematical formulas in LaTeX markdown,
    save the file securely, and record metadata to MongoDB and student's scan history.
    """
    user_id = current_user.id if current_user else "guest_student"

    # Read uploaded bytes
    try:
        contents = await file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not read uploaded PDF file: {str(e)}"
        )

    file_name = file.filename or "uploaded_document.pdf"
    content_type = file.content_type or "application/pdf"

    # Process and convert via PdfService
    response_data, disk_path = pdf_service.process_pdf(
        file_bytes=contents,
        file_name=file_name,
        content_type=content_type,
        page_range_str=page_range,
        subject_hint=subject_hint
    )

    # Persist in storage layer (MongoDB + disk cache + scans collection)
    doc_dict = response_data.model_dump()
    doc_dict["file_path"] = disk_path
    store.save_pdf_document(doc_dict, user_id=user_id)

    return response_data


@router.get("/history", response_model=List[PdfHistoryItem])
def get_pdf_history(
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user),
    limit: int = 20
):
    """
    Retrieves the student's recent uploaded PDF documents history.
    """
    user_id = current_user.id if current_user else "guest_student"
    items = store.get_pdf_history(user_id=user_id, limit=limit)
    return [
        PdfHistoryItem(
            id=d.get("doc_id", d.get("id", "")),
            doc_id=d.get("doc_id", d.get("id", "")),
            user_id=d.get("user_id", user_id),
            file_name=d.get("file_name", "document.pdf"),
            file_size_bytes=d.get("file_size_bytes", 0),
            page_count=d.get("page_count", 1),
            selected_page_range=d.get("selected_page_range", "all"),
            subject=d.get("subject", "Engineering"),
            topic=d.get("topic", "Core Concepts"),
            has_math=d.get("has_math", False),
            created_at=d.get("created_at", ""),
            download_url=f"/api/pdf/{d.get('doc_id')}/download",
            markdown_download_url=f"/api/pdf/{d.get('doc_id')}/markdown"
        )
        for d in items
    ]


@router.get("/{doc_id}", response_model=PdfProcessResponse)
def get_pdf_document(
    doc_id: str,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Fetches full metadata and extracted Markdown for a processed PDF document.
    """
    user_id = current_user.id if current_user else "guest_student"
    doc = store.get_pdf_document(doc_id, user_id=user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document '{doc_id}' not found."
        )

    # Ensure required fields for PdfProcessResponse
    return PdfProcessResponse(
        doc_id=doc["doc_id"],
        file_name=doc.get("file_name", "document.pdf"),
        file_size_bytes=doc.get("file_size_bytes", 0),
        page_count=doc.get("page_count", 1),
        selected_page_range=doc.get("selected_page_range", "all"),
        extracted_markdown=doc.get("extracted_markdown", ""),
        extracted_text=doc.get("extracted_text", ""),
        subject=doc.get("subject", "Engineering"),
        topic=doc.get("topic", "Core Concepts"),
        pages=doc.get("pages", []),
        has_math=doc.get("has_math", False),
        has_scanned_pages=doc.get("has_scanned_pages", False),
        download_url=f"/api/pdf/{doc_id}/download",
        markdown_download_url=f"/api/pdf/{doc_id}/markdown",
        created_at=doc.get("created_at", "")
    )


@router.put("/{doc_id}", response_model=PdfProcessResponse)
def update_pdf_document(
    doc_id: str,
    updates: PdfUpdateRequest,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Updates student's edited Markdown, subject, or topic for the PDF document.
    """
    user_id = current_user.id if current_user else "guest_student"
    update_data = {}
    if updates.edited_markdown is not None:
        update_data["extracted_markdown"] = updates.edited_markdown
        update_data["extracted_text"] = updates.edited_markdown
    if updates.subject is not None:
        update_data["subject"] = updates.subject
    if updates.topic is not None:
        update_data["topic"] = updates.topic
    if updates.selected_page_range is not None:
        update_data["selected_page_range"] = updates.selected_page_range

    updated_doc = store.update_pdf_document(doc_id, update_data, user_id=user_id)
    if not updated_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"PDF document '{doc_id}' not found or update failed."
        )

    return PdfProcessResponse(
        doc_id=updated_doc["doc_id"],
        file_name=updated_doc.get("file_name", "document.pdf"),
        file_size_bytes=updated_doc.get("file_size_bytes", 0),
        page_count=updated_doc.get("page_count", 1),
        selected_page_range=updated_doc.get("selected_page_range", "all"),
        extracted_markdown=updated_doc.get("extracted_markdown", ""),
        extracted_text=updated_doc.get("extracted_text", ""),
        subject=updated_doc.get("subject", "Engineering"),
        topic=updated_doc.get("topic", "Core Concepts"),
        pages=updated_doc.get("pages", []),
        has_math=updated_doc.get("has_math", False),
        has_scanned_pages=updated_doc.get("has_scanned_pages", False),
        download_url=f"/api/pdf/{doc_id}/download",
        markdown_download_url=f"/api/pdf/{doc_id}/markdown",
        created_at=updated_doc.get("created_at", "")
    )


@router.get("/{doc_id}/download")
def download_original_pdf(
    doc_id: str,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Securely download the original uploaded PDF file.
    """
    user_id = current_user.id if current_user else "guest_student"
    doc = store.get_pdf_document(doc_id, user_id=user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF document not found."
        )

    file_path = doc.get("file_path")
    if not file_path or not Path(file_path).exists():
        # Fallback check standard PDF upload directory
        alt_path = Path(settings.PDF_UPLOAD_DIR) / f"{doc_id}.pdf"
        if alt_path.exists():
            file_path = str(alt_path)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF binary file is not found on disk."
            )

    safe_filename = doc.get("file_name", "document.pdf")
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=safe_filename
    )


@router.get("/{doc_id}/markdown")
def download_converted_markdown(
    doc_id: str,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Download the converted and formatted Markdown (.md) representation of the PDF.
    """
    user_id = current_user.id if current_user else "guest_student"
    doc = store.get_pdf_document(doc_id, user_id=user_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="PDF document not found."
        )

    markdown_content = doc.get("extracted_markdown", "")
    clean_stem = Path(doc.get("file_name", "notes")).stem
    safe_md_filename = f"{clean_stem}.md"

    return Response(
        content=markdown_content.encode("utf-8"),
        media_type="text/markdown; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{safe_md_filename}"'
        }
    )

