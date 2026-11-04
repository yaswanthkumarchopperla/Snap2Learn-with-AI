from pydantic import BaseModel, Field

class ScanResponse(BaseModel):
    text: str = Field(..., description="Extracted OCR text with mathematical formulas preserved")
    subject: str = Field(..., description="Identified academic subject (e.g. Mathematics, Machine Learning)")
    topic: str = Field(..., description="Specific identified topic")
    confidence: str = Field("High", description="Extraction confidence: High, Medium, Low")
    uncertain_segments: list[str] = Field(default_factory=list, description="List of phrases that were partially unclear or handwritten")
    is_demo: bool = Field(False, description="True if response is generated via demo mode fallback")
    image_preview_url: str | None = Field(None, description="Optional data URL or URL for local review")
