from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.note import FlashcardItem, FlashcardReviewRequest
from app.services.storage_service import store

router = APIRouter(prefix="/flashcards", tags=["Flashcards"])

class FlashcardCreate(BaseModel):
    subject: str
    topic: str
    front_prompt: str
    back_answer: str
    formula_or_code: Optional[str] = None
    difficulty: str = "medium"

@router.get("", response_model=List[FlashcardItem])
def list_flashcards(subject: Optional[str] = None):
    """Retrieve flashcards with optional subject filter."""
    return store.get_flashcards(subject=subject)

@router.post("", response_model=FlashcardItem)
def create_flashcard(data: FlashcardCreate):
    """Manually add or automatically store a new flashcard."""
    card = store.add_flashcard(
        subject=data.subject,
        topic=data.topic,
        front=data.front_prompt,
        back=data.back_answer,
        formula_or_code=data.formula_or_code,
        difficulty=data.difficulty
    )
    return card

@router.post("/{card_id}/review", response_model=FlashcardItem)
def review_flashcard(card_id: str, request: FlashcardReviewRequest):
    """Submit a student's review of a flashcard (Easy, Medium, Hard)."""
    updated = store.review_flashcard(card_id, request.rating)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flashcard '{card_id}' not found."
        )
    return updated
