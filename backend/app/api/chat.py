import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.schemas.chat import ChatRequest, ChatResponse, ChatSessionItem, ChatMessage
from app.services.gemini_service import gemini_service
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/chat", tags=["AI Tutor"])

@router.post("", response_model=ChatResponse)
def chat_with_tutor(
    request: ChatRequest,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Conversational follow-up tutor answering questions about the study material.
    Automatically saves chat messages and responses to the student's conversation session.
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

    user_id = current_user.id if current_user else "guest_student"
    session_id = request.session_id or f"sess-{uuid.uuid4().hex[:8]}"
    response.session_id = session_id

    # Autosave interaction
    user_msg = {"role": "user", "content": request.message}
    ai_msg = {"role": "model", "content": response.reply}
    store.save_chat_message(
        session_id=session_id,
        user_id=user_id,
        user_message=user_msg,
        ai_reply=ai_msg,
        subject=request.subject,
        topic=request.topic
    )

    return response

@router.get("/sessions", response_model=List[ChatSessionItem])
def list_chat_sessions(
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user),
    limit: int = 20
):
    """Retrieve saved chat sessions for the current student to restore past conversations."""
    user_id = current_user.id if current_user else "guest_student"
    sessions = store.get_chat_sessions(user_id=user_id, limit=limit)
    res = []
    for s in sessions:
        res.append(ChatSessionItem(
            session_id=s["session_id"],
            user_id=s.get("user_id", user_id),
            subject=s.get("subject", "General Engineering"),
            topic=s.get("topic", "Core Concepts"),
            title=s.get("title", "Study Session"),
            messages=[ChatMessage(**m) for m in s.get("messages", [])],
            updated_at=s.get("updated_at", "")
        ))
    return res

@router.get("/sessions/{session_id}", response_model=ChatSessionItem)
def get_single_chat_session(
    session_id: str,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Restore a specific conversation thread."""
    user_id = current_user.id if current_user else "guest_student"
    sess = store.get_chat_session(session_id=session_id, user_id=user_id)
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chat session '{session_id}' not found."
        )
    return ChatSessionItem(
        session_id=sess["session_id"],
        user_id=sess.get("user_id", user_id),
        subject=sess.get("subject", "General Engineering"),
        topic=sess.get("topic", "Core Concepts"),
        title=sess.get("title", "Study Session"),
        messages=[ChatMessage(**m) for m in sess.get("messages", [])],
        updated_at=sess.get("updated_at", "")
    )
