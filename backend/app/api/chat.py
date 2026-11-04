from fastapi import APIRouter, HTTPException, status
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/chat", tags=["AI Tutor"])

@router.post("", response_model=ChatResponse)
def chat_with_tutor(request: ChatRequest):
    """
    Conversational follow-up tutor answering questions about the study material.
    """
    if not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty."
        )

    response = gemini_service.chat_tutor(
        message=request.message,
        study_context=request.study_context,
        subject=request.subject,
        history=request.history,
        language=request.language
    )
    return response
