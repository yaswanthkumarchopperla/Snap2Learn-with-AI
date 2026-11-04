from fastapi import APIRouter
from app.schemas.note import ProgressAnalytics
from app.services.storage_service import store

router = APIRouter(prefix="/progress", tags=["Progress Analytics"])

@router.get("", response_model=ProgressAnalytics)
def get_user_progress():
    """
    Retrieve real computed student progress analytics based on completed quiz sessions,
    accuracy trends, subject distribution, and flagged weak concepts.
    """
    return store.get_analytics()
