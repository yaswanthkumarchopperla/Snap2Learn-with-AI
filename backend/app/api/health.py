from fastapi import APIRouter
from app.core.config import settings
from app.services.mongodb_service import mongodb_service
from app.services.brevo_service import brevo_service

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
@router.get("/")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": settings.is_gemini_configured,
        "gemini_model": settings.GEMINI_MODEL,
        "mongodb_connected": mongodb_service.is_connected,
        "brevo_configured": brevo_service.is_configured,
        "demo_mode_active": not settings.is_gemini_configured,
        "features": {
            "camera_scanner": True,
            "multimodal_ocr": True,
            "bilingual_telugu": True,
            "quiz_arena": True,
            "deterministic_scoring": True,
            "flashcards": True,
            "progress_analytics": True,
            "mongodb_storage": True,
            "brevo_email_auth": True
        }
    }
