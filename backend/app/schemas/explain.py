from pydantic import BaseModel, Field
from typing import Literal

ExplanationMode = Literal["beginner", "standard", "exam"]
ExplanationLanguage = Literal["english", "telugu", "bilingual"]

class KeyDefinition(BaseModel):
    term: str
    definition: str
    telugu_translation: str | None = None

class FormulaItem(BaseModel):
    name: str
    latex: str
    explanation: str

class CommonMistake(BaseModel):
    mistake: str
    correction: str

class ExplainRequest(BaseModel):
    text: str = Field(..., min_length=3, description="Confirmed extracted or typed study material")
    subject: str = Field("General", description="Subject category")
    topic: str = Field("General Study Topic", description="Topic title")
    mode: ExplanationMode = Field("standard", description="beginner, standard, or exam")
    language: ExplanationLanguage = Field("english", description="english, telugu, or bilingual")

class ExplainResponse(BaseModel):
    subject: str
    topic: str
    mode: ExplanationMode
    language: ExplanationLanguage
    short_summary: str
    detailed_steps: list[str]
    key_definitions: list[KeyDefinition]
    formulas: list[FormulaItem]
    real_life_example: str
    common_mistakes: list[CommonMistake]
    exam_answer: str
    quick_revision_notes: list[str]
    telugu_summary: str | None = None
    is_demo: bool = False
