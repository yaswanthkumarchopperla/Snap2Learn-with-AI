from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.note import (
    FlashcardItem,
    FlashcardCreate,
    FlashcardUpdate,
    FlashcardReviewRequest,
    FlashcardGenerateRequest,
    FlashcardGenerateResponse
)
from app.services.storage_service import store
from app.services.gemini_service import gemini_service
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

class FlashcardBatchRequest(BaseModel):
    cards: List[FlashcardCreate]

@router.get("", response_model=List[FlashcardItem])
def list_flashcards(
    subject: Optional[str] = None,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Retrieve flashcards for the current user with optional subject filter."""
    user_id = current_user.id if current_user else "guest_student"
    return store.get_flashcards(subject=subject, user_id=user_id)

@router.post("/generate", response_model=FlashcardGenerateResponse)
def generate_flashcards_endpoint(
    payload: FlashcardGenerateRequest,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Generate topic-focused active recall flashcards using Gemini AI and
    immediately auto-save them for continuous revision anytime.
    """
    user_id = current_user.id if current_user else "guest_student"

    if not payload.topic or not payload.topic.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic is required to generate topic-relevant flashcards."
        )

    # 1. Generate active recall cards via Gemini service (with fallback & retry support)
    card_creates, is_demo = gemini_service.generate_flashcards(
        topic=payload.topic.strip(),
        subject=payload.subject or "General",
        context_text=payload.context_text,
        card_count=payload.card_count,
        difficulty_focus=payload.difficulty_focus or "mixed",
        note_id=payload.note_id
    )

    # 2. Immediately autosave each generated card into the database
    cards_data = [c.model_dump() for c in card_creates]
    saved_cards = store.save_flashcards_batch(cards=cards_data, user_id=user_id)

    return FlashcardGenerateResponse(
        cards=saved_cards,
        count=len(saved_cards),
        topic=payload.topic.strip(),
        subject=payload.subject or "General",
        is_demo=is_demo,
        autosaved=True
    )

@router.post("", response_model=FlashcardItem)
def create_flashcard(
    data: FlashcardCreate,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Autosave or manually add a new flashcard for the current user."""
    user_id = current_user.id if current_user else "guest_student"
    card = store.add_flashcard(
        subject=data.subject,
        topic=data.topic,
        front=data.front_prompt,
        back=data.back_answer,
        formula_or_code=data.formula_or_code,
        difficulty=data.difficulty,
        is_bookmarked=data.is_bookmarked,
        learning_status=data.learning_status,
        note_id=data.note_id,
        user_id=user_id,
        card_id=data.id
    )
    return card

@router.post("/batch", response_model=List[FlashcardItem])
def create_flashcards_batch(
    payload: FlashcardBatchRequest,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Autosave a whole batch of generated or imported flashcards."""
    user_id = current_user.id if current_user else "guest_student"
    cards_data = [c.model_dump() for c in payload.cards]
    return store.save_flashcards_batch(cards=cards_data, user_id=user_id)

@router.put("/{card_id}", response_model=FlashcardItem)
def update_flashcard(
    card_id: str,
    data: FlashcardUpdate,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Autosave updates to flashcard content, bookmark state, or learning status."""
    user_id = current_user.id if current_user else "guest_student"
    updates = data.model_dump(exclude_unset=True)
    updated = store.update_flashcard(card_id=card_id, updates=updates, user_id=user_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcard '{card_id}' not found."
        )
    return updated

@router.delete("/{card_id}")
def delete_flashcard(
    card_id: str,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Delete a flashcard from the student's study deck."""
    user_id = current_user.id if current_user else "guest_student"
    success = store.delete_flashcard(card_id=card_id, user_id=user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcard '{card_id}' not found or unauthorized to delete."
        )
    return {"status": "success", "deleted_card_id": card_id}

@router.post("/{card_id}/review", response_model=FlashcardItem)
def review_flashcard(card_id: str, request: FlashcardReviewRequest):
    """Submit a student's review of a flashcard (Easy, Medium, Hard)."""
    updated = store.review_flashcard(card_id, request.rating, request.learning_status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcard '{card_id}' not found."
        )
    return updated
