from pydantic import BaseModel, Field
from typing import Optional

class UserPreferences(BaseModel):
    preferred_language: str = Field("en", description="Preferred response language: en or te")
    default_difficulty: str = Field("medium", description="easy, medium, or hard")
    default_quiz_questions: int = Field(5, description="Default number of questions: 5 or 10")
    study_mode: str = Field("standard", description="standard, exam_cram, or deep_dive")
    theme: str = Field("dark", description="Visual theme")
    auto_save_enabled: bool = Field(True, description="Whether automatic background sync is enabled")

