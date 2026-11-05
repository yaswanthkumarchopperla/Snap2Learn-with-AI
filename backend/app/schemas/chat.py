from pydantic import BaseModel, Field
from typing import Literal, Optional, List

ChatRole = Literal["user", "model", "system"]

class ChatMessage(BaseModel):
    role: ChatRole
    content: str

class ChatRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Optional existing session ID to append to")
    message: str = Field(..., min_length=1, description="Student's message or question")
    study_context: Optional[str] = Field(None, description="Current study notes or topic context")
    subject: Optional[str] = Field(None, description="Current subject")
    topic: Optional[str] = Field(None, description="Current topic")
    history: List[ChatMessage] = Field(default_factory=list, description="Prior conversation messages")
    language: Literal["english", "telugu", "bilingual"] = Field("english", description="Preferred response language")

class ChatResponse(BaseModel):
    session_id: Optional[str] = None
    reply: str
    suggested_followups: List[str] = Field(default_factory=list)
    is_demo: bool = False

class ChatSessionItem(BaseModel):
    session_id: str
    user_id: str
    subject: str
    topic: str
    title: str
    messages: List[ChatMessage]
    updated_at: str
