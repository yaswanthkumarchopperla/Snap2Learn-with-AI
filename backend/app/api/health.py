from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    return {
        "status": "healthy",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": settings.is_gemini_configured,
        "gemini_model": settings.GEMINI_MODEL,
        "demo_mode_active": not settings.is_gemini_configured,
        "features": {
            "camera_scanner": True,
            "multimodal_ocr": True,
            "bilingual_telugu": True,
            "quiz_arena": True,
            "deterministic_scoring": True,
            "flashcards": True,
            "progress_analytics": True
        }
    }
