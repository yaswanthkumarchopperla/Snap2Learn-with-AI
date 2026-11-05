from pydantic import BaseModel, Field
from typing import Literal, Optional

DifficultyLevel = Literal["easy", "medium", "hard"]

class QuestionItem(BaseModel):
    id: str = Field(..., description="Unique question identifier")
    question: str = Field(..., description="Clear question stem")
    options: list[str] = Field(..., min_length=4, max_length=4, description="Exactly 4 distinct options")
    correct_index: int = Field(..., ge=0, le=3, description="Index of the correct choice (0 to 3)")
    explanation: str = Field(..., description="Explanation of why this answer is correct")
    topic_tag: str = Field("Core Concept", description="Specific concept tested")

class QuestionClientView(BaseModel):
    id: str
    question: str
    options: list[str]
    topic_tag: str

class QuizGenerateRequest(BaseModel):
    study_text: str = Field(..., min_length=10, description="Source study material or notes")
    subject: str = Field("Computer Science & Engineering", description="Academic subject")
    topic: str = Field("Core Concepts", description="Topic title")
    num_questions: int = Field(5, ge=3, le=15, description="Number of questions: 5, 10, or 15")
    difficulty: DifficultyLevel = Field("medium", description="easy, medium, or hard")
    is_retake: bool = Field(False, description="Flag indicating if this is a retake of a previous quiz")
    user_id: Optional[str] = Field(None, description="Optional student user ID for tracking")

class QuizGenerateResponse(BaseModel):
    quiz_id: str
    title: str
    subject: str
    topic: str
    difficulty: DifficultyLevel
    total_questions: int
    questions: list[QuestionClientView]
    is_demo: bool = False
    is_fresh_retake: bool = True
    notice: Optional[str] = None

class QuizSubmitRequest(BaseModel):
    quiz_id: str
    answers: dict[str, int] = Field(..., description="Map of question_id to selected option index (0-3)")
    time_taken_seconds: int = Field(0, ge=0)
    user_id: Optional[str] = Field(None, description="Optional student user ID for tracking")

class QuestionReview(BaseModel):
    id: str
    question: str
    options: list[str]
    selected_index: int | None
    correct_index: int
    is_correct: bool
    explanation: str
    topic_tag: str

class QuizSubmitResponse(BaseModel):
    quiz_id: str
    attempt_id: str = Field("", description="Unique attempt ID for this submission")
    total_questions: int
    correct_count: int
    score_percentage: float
    passed: bool
    time_taken_seconds: int
    question_reviews: list[QuestionReview]
    weak_topics: list[str]
    revision_recommendation: str
