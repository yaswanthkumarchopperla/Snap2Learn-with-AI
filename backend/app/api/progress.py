from fastapi import APIRouter, Depends
from typing import Optional
from app.schemas.note import ProgressAnalytics
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/progress", tags=["Progress Analytics"])

@router.get("", response_model=ProgressAnalytics)
def get_user_progress(current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)):
    """
    Retrieve real computed student progress analytics based on completed quiz sessions,
    accuracy trends, subject distribution, reviewed flashcards, and flagged weak concepts.
    Scoped specifically to the authenticated student.
    """
    user_id = current_user.id if current_user else "guest_student"
    return store.get_analytics(user_id=user_id)
