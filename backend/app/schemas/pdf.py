from pydantic import BaseModel, Field
from typing import Optional, List

class PageExtractItem(BaseModel):
    page_number: int = Field(..., description="1-based page index")
    text: str = Field(..., description="Raw text extracted from this page")
    markdown: str = Field(..., description="Formatted Markdown representation")
    is_ocr: bool = Field(False, description="True if page was processed via OCR (scanned/image page)")
    has_math: bool = Field(False, description="True if mathematical expressions were detected")
    has_table: bool = Field(False, description="True if tables were detected on this page")

class PdfProcessResponse(BaseModel):
    doc_id: str = Field(..., description="Unique document ID")
    file_name: str = Field(..., description="Original uploaded filename")
    file_size_bytes: int = Field(..., description="Size in bytes")
    page_count: int = Field(..., description="Total pages in the PDF")
    selected_page_range: str = Field("all", description="Selected pages processed (e.g. 'all', '1-3', '2,4')")
    extracted_markdown: str = Field(..., description="Complete converted Markdown with KaTeX math delimiters")
    extracted_text: str = Field(..., description="Clean plain text version")
    subject: str = Field("Engineering", description="Identified academic subject")
    topic: str = Field("Core Concepts", description="Identified topic/chapter title")
    pages: List[PageExtractItem] = Field(default_factory=list, description="Page-by-page breakdown")
    has_math: bool = Field(False, description="True if mathematical formulas were detected")
    has_scanned_pages: bool = Field(False, description="True if any pages required OCR")
    download_url: str = Field(..., description="Secure download URL for original PDF")
    markdown_download_url: str = Field(..., description="Secure download URL for converted .md file")
    created_at: str

class PdfUpdateRequest(BaseModel):
    edited_markdown: Optional[str] = Field(None, description="Updated Markdown content")
    subject: Optional[str] = Field(None, description="Updated subject")
    topic: Optional[str] = Field(None, description="Updated topic")
    selected_page_range: Optional[str] = Field(None, description="Updated page range selection")

class PdfHistoryItem(BaseModel):
    id: str
    doc_id: str
    user_id: str
    file_name: str
    file_size_bytes: int
    page_count: int
    selected_page_range: str
    subject: str
    topic: str
    has_math: bool = False
    created_at: str
    download_url: str
    markdown_download_url: str

