from pydantic import BaseModel, Field
from typing import Literal

ChatRole = Literal["user", "model", "system"]

class ChatMessage(BaseModel):
    role: ChatRole
    content: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Student's message or question")
    study_context: str | None = Field(None, description="Current study notes or topic context")
    subject: str | None = Field(None, description="Current subject")
    history: list[ChatMessage] = Field(default_factory=list, description="Prior conversation messages")
    language: Literal["english", "telugu", "bilingual"] = Field("english", description="Preferred response language")

class ChatResponse(BaseModel):
    reply: str
    suggested_followups: list[str] = Field(default_factory=list)
    is_demo: bool = False
