from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime

class NoteItem(BaseModel):
    id: str
    user_id: str = "guest_student"
    title: str
    subject: str
    topic: str
    raw_text: str
    summary: str | None = None
    created_at: str
    quiz_count: int = 0
    accuracy: float = 0.0

class NoteCreate(BaseModel):
    title: str
    subject: str
    topic: str
    raw_text: str
    summary: str | None = None

class FlashcardItem(BaseModel):
    id: str
    note_id: str | None = None
    subject: str
    topic: str
    front_prompt: str
    back_answer: str
    formula_or_code: str | None = None
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    review_count: int = 0
    next_review: str | None = None

class FlashcardReviewRequest(BaseModel):
    rating: Literal["easy", "medium", "hard"]

class ProgressAnalytics(BaseModel):
    total_notes: int
    quizzes_completed: int
    average_accuracy: float
    study_streak_days: int
    subject_performance: list[dict]
    weak_topics: list[str]
    recent_activity: list[dict]
    recommended_revision: str | None
