import io
import time
import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, status
from typing import Optional, List, Dict, Tuple
from PIL import Image

from app.core.config import settings
from app.schemas.scan import ScanResponse, ScanHistoryItem
from app.services.gemini_service import gemini_service
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/scan", tags=["Scanner"])

# In-memory recent scan cache for upload deduplication on network retries (TTL: 5 minutes)
_recent_scan_cache: Dict[str, Tuple[float, ScanResponse]] = {}
CACHE_TTL_SECONDS = 300

@router.post("", response_model=ScanResponse)
async def scan_notes(
    file: UploadFile = File(...),
    subject_hint: Optional[str] = Form(None),
    idempotency_key: Optional[str] = Form(None),
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Validate uploaded file and process via Gemini Multimodal OCR.
    Extracts text, mathematical formulas, subject, and topic, and automatically
    persists the scan result to the student's scan history.
    Includes idempotency deduplication to prevent duplicate processing on retried uploads.
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

    # 4. Check for duplicate upload / retry using content hash + user id
    user_id = current_user.id if current_user else "guest_student"
    content_hash = hashlib.sha256(contents).hexdigest()[:16]
    dedup_key = f"{user_id}:{idempotency_key or content_hash}:{subject_hint or ''}"

    now = time.time()
    if dedup_key in _recent_scan_cache:
        cached_time, cached_result = _recent_scan_cache[dedup_key]
        if now - cached_time < CACHE_TTL_SECONDS:
            return cached_result

    # 5. Process with Gemini service (with automatic exponential backoff & fallback models)
    scan_result = gemini_service.scan_image(
        image_bytes=contents,
        mime_type=file.content_type,
        subject_hint=subject_hint
    )

    # 6. Autosave scan to history
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

    # Cache result to prevent duplicate processing on retries
    _recent_scan_cache[dedup_key] = (now, scan_result)

    # Prune expired cache entries
    expired = [k for k, (t, _) in _recent_scan_cache.items() if now - t > CACHE_TTL_SECONDS]
    for k in expired:
        _recent_scan_cache.pop(k, None)

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
