from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any

class NoteItem(BaseModel):
    id: str
    user_id: str = "guest_student"
    title: str
    subject: str
    topic: str
    raw_text: str
    summary: Optional[str] = None
    telugu_summary: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    quiz_count: int = 0
    accuracy: float = 0.0

class NoteCreate(BaseModel):
    id: Optional[str] = None
    title: str
    subject: str
    topic: str
    raw_text: str
    summary: Optional[str] = None
    telugu_summary: Optional[str] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    raw_text: Optional[str] = None
    summary: Optional[str] = None
    telugu_summary: Optional[str] = None

class FlashcardItem(BaseModel):
    id: str
    user_id: str = "guest_student"
    note_id: Optional[str] = None
    subject: str
    topic: str
    front_prompt: str
    back_answer: str
    formula_or_code: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    is_bookmarked: bool = False
    learning_status: Literal["known", "learning", "unknown"] = "learning"
    review_count: int = 0
    next_review: Optional[str] = None
    updated_at: Optional[str] = None

class FlashcardCreate(BaseModel):
    id: Optional[str] = None
    note_id: Optional[str] = None
    subject: str
    topic: str
    front_prompt: str
    back_answer: str
    formula_or_code: Optional[str] = None
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    is_bookmarked: bool = False
    learning_status: Literal["known", "learning", "unknown"] = "learning"

class FlashcardUpdate(BaseModel):
    front_prompt: Optional[str] = None
    back_answer: Optional[str] = None
    formula_or_code: Optional[str] = None
    difficulty: Optional[Literal["easy", "medium", "hard"]] = None
    is_bookmarked: Optional[bool] = None
    learning_status: Optional[Literal["known", "learning", "unknown"]] = None

class FlashcardReviewRequest(BaseModel):
    rating: Literal["easy", "medium", "hard"]
    learning_status: Optional[Literal["known", "learning", "unknown"]] = None

class FlashcardGenerateRequest(BaseModel):
    topic: str
    subject: Optional[str] = "General"
    context_text: Optional[str] = None
    card_count: int = Field(default=5, ge=1, le=20)
    note_id: Optional[str] = None
    difficulty_focus: Optional[Literal["easy", "medium", "hard", "mixed"]] = "mixed"

class FlashcardGenerateResponse(BaseModel):
    cards: List[FlashcardItem]
    count: int
    topic: str
    subject: str
    is_demo: bool = False
    autosaved: bool = True

class ProgressAnalytics(BaseModel):
    total_notes: int
    quizzes_completed: int
    average_accuracy: float
    study_streak_days: int
    flashcards_reviewed: int = 0
    subject_performance: List[Dict[str, Any]]
    weak_topics: List[str]
    recent_activity: List[Dict[str, Any]]
    recommended_revision: Optional[str] = None
