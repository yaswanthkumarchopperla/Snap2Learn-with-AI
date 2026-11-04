import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Optional
from PIL import Image

from app.core.config import settings
from app.schemas.scan import ScanResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/scan", tags=["Scanner"])

@router.post("", response_model=ScanResponse)
async def scan_notes(
    file: UploadFile = File(...),
    subject_hint: Optional[str] = Form(None)
):
    """
    Validate uploaded file and process via Gemini Multimodal OCR.
    Extracts text, mathematical formulas, subject, and topic.
    """
    # 1. Validate MIME type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{file.content_type}'. Please upload JPEG, PNG, or WebP."
        )

    # 2. Read bytes and check size
    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # 3. Verify image integrity with Pillow
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is corrupted or not a valid image."
        )

    # 4. Process with Gemini service
    scan_result = gemini_service.scan_image(
        image_bytes=contents,
        mime_type=file.content_type,
        subject_hint=subject_hint
    )

    return scan_result
