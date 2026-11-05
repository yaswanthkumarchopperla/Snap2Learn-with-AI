from pydantic import BaseModel, Field
from typing import Optional, List

class ScanResponse(BaseModel):
    scan_id: Optional[str] = None
    text: str = Field(..., description="Extracted OCR text with mathematical formulas preserved")
    subject: str = Field(..., description="Identified academic subject (e.g. Mathematics, Machine Learning)")
    topic: str = Field(..., description="Specific identified topic")
    confidence: str = Field("High", description="Extraction confidence: High, Medium, Low")
    uncertain_segments: List[str] = Field(default_factory=list, description="List of phrases that were partially unclear or handwritten")
    is_demo: bool = Field(False, description="True if response is generated via demo mode fallback")
    image_preview_url: Optional[str] = Field(None, description="Optional data URL or URL for local review")
    created_at: Optional[str] = None

class ScanHistoryItem(BaseModel):
    id: str
    user_id: str
    text: str
    subject: str
    topic: str
    confidence: str
    uncertain_segments: List[str] = Field(default_factory=list)
    created_at: str
