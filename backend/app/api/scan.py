import io
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from typing import Optional, List
from PIL import Image

from app.core.config import settings
from app.schemas.scan import ScanResponse, ScanHistoryItem
from app.services.gemini_service import gemini_service
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/scan", tags=["Scanner"])

@router.post("", response_model=ScanResponse)
async def scan_notes(
    file: UploadFile = File(...),
    subject_hint: Optional[str] = Form(None),
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Validate uploaded file and process via Gemini Multimodal OCR.
    Extracts text, mathematical formulas, subject, and topic, and automatically
    persists the scan result to the student's scan history.
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

    # 5. Autosave scan to history
    user_id = current_user.id if current_user else "guest_student"
    scan_id = f"scan-{uuid.uuid4().hex[:8]}"
    created_at = datetime.now(timezone.utc).isoformat()
    scan_result.scan_id = scan_id
    scan_result.created_at = created_at

    store.save_scan(
        scan_data={
            "id": scan_id,
            "text": scan_result.text,
            "subject": scan_result.subject,
            "topic": scan_result.topic,
            "confidence": scan_result.confidence,
            "uncertain_segments": scan_result.uncertain_segments,
            "created_at": created_at
        },
        user_id=user_id
    )

    return scan_result

@router.get("/history", response_model=List[ScanHistoryItem])
def get_scan_history(
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user),
    limit: int = 20
):
    """Retrieve the student's past scans to revisit extracted OCR texts."""
    user_id = current_user.id if current_user else "guest_student"
    scans = store.get_scan_history(user_id=user_id, limit=limit)
    return [ScanHistoryItem(**s) for s in scans]
