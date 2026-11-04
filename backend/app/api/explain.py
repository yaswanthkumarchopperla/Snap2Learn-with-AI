from fastapi import APIRouter, HTTPException, status
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/explain", tags=["Explanation Engine"])

@router.post("", response_model=ExplainResponse)
def explain_notes(request: ExplainRequest):
    """
    Generate comprehensive explanation for confirmed notes in Beginner, Standard, or Exam mode,
    with English, Telugu, or Bilingual outputs.
    """
    if len(request.text.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study text must contain at least 3 characters."
        )

    response = gemini_service.explain_material(
        text=request.text,
        subject=request.subject,
        topic=request.topic,
        mode=request.mode,
        language=request.language
    )
    return response
