import io
import os
import re
import uuid
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any, Tuple

from fastapi import HTTPException, status
import pymupdf

from app.core.config import settings
from app.schemas.pdf import PageExtractItem, PdfProcessResponse
from app.services.gemini_service import gemini_service

logger = logging.getLogger("snap2learn.pdf")

# Regex to detect LaTeX math commands & symbols
LATEX_MATH_REGEX = re.compile(
    r'\\(?:omega|pi|theta|lambda|alpha|beta|mu|Delta|Omega|sum|int|sqrt|frac|boxed|text|det|sin|cos|tan|matrix|sigma|gamma|epsilon|infty|approx|times|pm|partial|nabla)\b',
    re.IGNORECASE
)

# Common academic engineering subjects for heuristic classification
SUBJECT_PATTERNS = [
    (r'\b(?:matrix|matrices|eigenvalue|eigenvector|determinant|differential|integral|calculus|vector|linear algebra)\b', 'Engineering Mathematics', 'Linear Algebra & Calculus'),
    (r'\b(?:current|voltage|ac\b|dc\b|resistor|capacitor|inductor|frequency|rms|impedance|circuit|ohm|kirchhoff)\b', 'Electrical Engineering', 'AC Circuits & Fundamentals'),
    (r'\b(?:algorithm|complexity|stack|queue|binary tree|graph|sorting|recursion|pointer|array|data structure)\b', 'Computer Science', 'Data Structures & Algorithms'),
    (r'\b(?:process|thread|deadlock|semaphore|virtual memory|paging|cpu scheduling|operating system|kernel)\b', 'Computer Science', 'Operating Systems'),
    (r'\b(?:database|sql|relational|normalization|acid|b-tree|index|schema|foreign key)\b', 'Computer Science', 'Database Management Systems'),
    (r'\b(?:thermodynamics|fluid|entropy|enthalpy|stress|strain|beam|torque|velocity|acceleration)\b', 'Mechanical Engineering', 'Engineering Mechanics & Thermodynamics'),
]


def fix_escaped_newlines(text: str) -> str:
    """
    Unescapes literal '\\n' sequences when they represent actual newlines,
    while carefully preserving LaTeX commands starting with '\\n'
    (such as \\nabla, \\neq, \\nu, \\notin, etc.).
    """
    if not text:
        return ""
    # Replace double-escaped literal \n
    text = text.replace('\\\\n', '\n')
    # Replace single-escaped literal \n that is not a LaTeX macro
    return re.sub(r'\\n(?!(?:abla|eq|e|eg|otin|u|atural|obreak|ewline|ewcommand|ot|i|ull)\b)', '\n', text)


def normalize_latex_delimiters(text: str) -> Tuple[str, bool]:
    """
    Normalizes mathematical formulas and LaTeX notation into standard delimiters:
    - Block / display equations: \\[ ... \\] or $$ ... $$
    - Inline formulas: \\( ... \\) or $ ... $
    Returns (normalized_text, has_math).
    """
    if not text:
        return "", False

    text = fix_escaped_newlines(text)
    has_math = bool(LATEX_MATH_REGEX.search(text) or '$' in text or r'\[' in text or r'\(' in text)

    lines = text.split('\n')
    processed_lines = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            processed_lines.append("")
            continue

        # If line is already enclosed in $$...$$, \\[...\\], or markdown code fence
        if (
            (stripped.startswith('$$') and stripped.endswith('$$')) or
            (stripped.startswith('\\[') and stripped.endswith('\\]')) or
            stripped.startswith('```')
        ):
            processed_lines.append(line)
            continue

        # Check if entire line is a formula with LaTeX command or boxed
        if (
            (stripped.startswith(r'\boxed{') or stripped.startswith(r'\frac{') or stripped.startswith(r'\begin{')) or
            (('=' in stripped or r'\approx' in stripped) and LATEX_MATH_REGEX.search(stripped) and len(stripped.split()) <= 8)
        ):
            if not (stripped.startswith('$') or stripped.startswith(r'\(') or stripped.startswith(r'\[')):
                line = f"\\[ {stripped} \\]"
                has_math = True
                processed_lines.append(line)
                continue

        # Handle inline math expressions:
        # If line contains un-delimited LaTeX macros (e.g. \omega, \pi, \boxed), wrap them in \( ... \)
        if LATEX_MATH_REGEX.search(line) and '$' not in line and r'\(' not in line:
            # Wrap standalone LaTeX commands with simple arguments: \omega, \pi, \lambda, \Delta, etc.
            def wrap_inline_cmd(m):
                cmd = m.group(0)
                return f"\\({cmd}\\)"

            # Replace isolated greek letters/math operators
            line = re.sub(
                r'(?<![\\\$\w])(\\(?:omega|pi|theta|lambda|alpha|beta|mu|Delta|Omega|sum|int|sqrt|sigma|gamma|epsilon|infty|approx|times|pm|partial|nabla))\b(?![\\\$\w])',
                wrap_inline_cmd,
                line
            )
            has_math = True

        processed_lines.append(line)

    return '\n'.join(processed_lines), has_math


def parse_page_range(range_str: Optional[str], total_pages: int) -> List[int]:
    """
    Parses a page range string (e.g. 'all', '1-3', '1, 3, 5', '2-4, 7')
    and returns a sorted, deduplicated list of 0-based page indices.
    """
    if not range_str or range_str.strip().lower() in ("all", "*", ""):
        return list(range(total_pages))

    pages = set()
    parts = [p.strip() for p in range_str.split(',') if p.strip()]

    for p in parts:
        if '-' in p:
            sub = p.split('-', 1)
            try:
                start = max(1, int(sub[0].strip()))
                end = min(total_pages, int(sub[1].strip()))
                if start <= end:
                    for pg in range(start, end + 1):
                        pages.add(pg - 1)
            except ValueError:
                continue
        else:
            try:
                pg = int(p.strip())
                if 1 <= pg <= total_pages:
                    pages.add(pg - 1)
            except ValueError:
                continue

    sorted_pages = sorted(list(pages))
    if not sorted_pages:
        logger.warning(f"Invalid page range '{range_str}' for {total_pages} pages. Defaulting to all pages.")
        return list(range(total_pages))

    return sorted_pages


class PdfService:
    def __init__(self):
        self.upload_dir = Path(settings.PDF_UPLOAD_DIR)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    def validate_and_open_pdf(self, file_bytes: bytes, file_name: str, content_type: Optional[str] = None) -> pymupdf.Document:
        """
        Validates PDF MIME type, size limit, encryption, and opens PyMuPDF Document.
        """
        # Validate size
        max_bytes = settings.MAX_PDF_SIZE_MB * 1024 * 1024
        if len(file_bytes) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"PDF file exceeds the maximum allowed size of {settings.MAX_PDF_SIZE_MB}MB."
            )

        # Validate MIME type / extension
        ext = Path(file_name).suffix.lower()
        if content_type and content_type not in settings.ALLOWED_PDF_TYPES and ext != ".pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{content_type}'. Please upload a valid PDF document."
            )

        try:
            doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        except Exception as e:
            logger.error(f"Failed to open PDF '{file_name}': {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is not a valid PDF or is corrupted."
            )

        if doc.is_encrypted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The PDF file is password protected or encrypted. Please provide an unencrypted PDF."
            )

        if len(doc) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF contains no pages."
            )

        return doc

    def _ocr_page_with_gemini(self, page: pymupdf.Page, page_num: int) -> Tuple[str, bool]:
        """
        Renders a scanned page to a high-res image and performs OCR via Gemini Multimodal.
        """
        try:
            pix = page.get_pixmap(dpi=150)
            png_bytes = pix.tobytes("png")

            # Check if Gemini is available or running in test/offline environment
            if gemini_service.is_available and "PYTEST_CURRENT_TEST" not in os.environ:
                scan_res = gemini_service.scan_image(image_bytes=png_bytes, mime_type="image/png")
                ocr_text = scan_res.text.strip()
                if ocr_text:
                    return ocr_text, True

            # Offline / Fallback mode: attempt PyMuPDF OCR or minimal fallback
            fallback_text = page.get_text("text").strip()
            if not fallback_text:
                fallback_text = f"[Scanned page {page_num}: Visual diagram or handwritten content]"
            return fallback_text, True

        except Exception as e:
            logger.warning(f"Gemini OCR fallback failed for page {page_num}: {e}")
            raw = page.get_text("text").strip()
            return raw if raw else f"[Page {page_num}]", True

    def _extract_page_content(self, page: pymupdf.Page, page_num: int) -> PageExtractItem:
        """
        Extracts text, detects tables, handles scanned page OCR, and formats as clean Markdown.
        """
        raw_text = page.get_text("text") or ""
        non_ws_chars = len(re.sub(r'\s+', '', raw_text))

        is_ocr = False
        has_table = False

        # Detect if page is a scanned document / image (< 40 text characters)
        if non_ws_chars < 40:
            logger.info(f"Page {page_num} has only {non_ws_chars} text characters. Running OCR fallback.")
            extracted_text, is_ocr = self._ocr_page_with_gemini(page, page_num)
        else:
            extracted_text = raw_text

        # Extract tables via PyMuPDF table finder
        table_markdown_blocks = []
        try:
            tabs = page.find_tables()
            if tabs and tabs.tables:
                for tab in tabs.tables:
                    try:
                        md_tab = tab.to_markdown()
                        if md_tab and md_tab.strip():
                            table_markdown_blocks.append(md_tab.strip())
                            has_table = True
                    except Exception as tab_err:
                        logger.debug(f"Table conversion error on page {page_num}: {tab_err}")
        except Exception as e:
            logger.debug(f"Table finder error on page {page_num}: {e}")

        # Normalize LaTeX math and delimiters
        norm_text, has_math = normalize_latex_delimiters(extracted_text)

        # Build clean page markdown
        md_lines = []
        md_lines.append(norm_text.strip())

        if table_markdown_blocks:
            md_lines.append("\n**Extracted Tables:**\n")
            for tmd in table_markdown_blocks:
                md_lines.append(tmd)
                md_lines.append("\n")

        page_markdown = "\n\n".join(md_lines).strip()

        return PageExtractItem(
            page_number=page_num,
            text=extracted_text.strip(),
            markdown=page_markdown,
            is_ocr=is_ocr,
            has_math=has_math,
            has_table=has_table
        )

    def _infer_subject_and_topic(self, combined_text: str, file_name: str) -> Tuple[str, str]:
        """
        Infers academic subject and topic title based on content keywords and file name.
        """
        lower = combined_text.lower()
        fn_clean = Path(file_name).stem.replace('_', ' ').replace('-', ' ').title()

        # Check keyword patterns
        for pattern, subj, default_topic in SUBJECT_PATTERNS:
            if re.search(pattern, lower, re.IGNORECASE):
                # Try to extract first heading as topic if available
                first_heading_match = re.search(r'^(?:#+\s*|Chapter\s+\d+:?\s*|Unit\s+\d+:?\s*)([^\n]+)', combined_text, re.MULTILINE)
                topic = first_heading_match.group(1).strip() if first_heading_match else default_topic
                return subj, topic

        # Fallback to file name stem or general engineering
        return "Engineering", fn_clean if fn_clean else "Core Lecture Notes"

    def process_pdf(
        self,
        file_bytes: bytes,
        file_name: str,
        content_type: Optional[str] = None,
        page_range_str: Optional[str] = "all",
        subject_hint: Optional[str] = None
    ) -> Tuple[PdfProcessResponse, str]:
        """
        Main PDF extraction and conversion pipeline:
        1. Validates and opens document.
        2. Parses page range.
        3. Extracts text/tables and converts each page to Markdown.
        4. Detects math formulas with LaTeX formatting.
        5. Saves original PDF to disk storage.
        6. Returns structured PdfProcessResponse and disk file path.
        """
        doc = self.validate_and_open_pdf(file_bytes, file_name, content_type)
        total_pages = len(doc)

        # Parse requested page range
        page_indices = parse_page_range(page_range_str, total_pages)
        if not page_range_str or page_range_str.strip().lower() in ("all", "*"):
            selected_range_display = f"1-{total_pages}" if total_pages > 1 else "1"
        else:
            selected_range_display = page_range_str.strip()

        pages_extracted: List[PageExtractItem] = []
        has_any_math = False
        has_any_scanned = False

        for idx in page_indices:
            page_obj = doc[idx]
            page_item = self._extract_page_content(page_obj, page_num=idx + 1)
            pages_extracted.append(page_item)
            if page_item.has_math:
                has_any_math = True
            if page_item.is_ocr:
                has_any_scanned = True

        # Generate unique Document ID
        doc_id = f"pdf-{uuid.uuid4().hex[:12]}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # Combine page markdowns
        combined_text_parts = [p.text for p in pages_extracted if p.text]
        full_extracted_text = "\n\n".join(combined_text_parts)

        # Build clean complete markdown
        clean_name = Path(file_name).stem.replace('_', ' ').replace('-', ' ').title()
        md_builder = [f"# {clean_name}\n"]

        if len(pages_extracted) == 1:
            md_builder.append(pages_extracted[0].markdown)
        else:
            for p in pages_extracted:
                md_builder.append(f"## Page {p.page_number}\n")
                md_builder.append(p.markdown)
                md_builder.append("\n---\n")

        full_markdown = "\n\n".join(md_builder).strip()

        # Subject and Topic detection
        if subject_hint and subject_hint.strip():
            subject = subject_hint.strip()
            topic = clean_name
        else:
            subject, topic = self._infer_subject_and_topic(full_extracted_text, file_name)

        # Save binary PDF to disk
        saved_file_path = self.upload_dir / f"{doc_id}.pdf"
        try:
            with open(saved_file_path, "wb") as f:
                f.write(file_bytes)
            logger.info(f"Saved uploaded PDF to disk: {saved_file_path}")
        except Exception as e:
            logger.error(f"Failed to save PDF {doc_id} to disk: {e}")

        response = PdfProcessResponse(
            doc_id=doc_id,
            file_name=file_name,
            file_size_bytes=len(file_bytes),
            page_count=total_pages,
            selected_page_range=selected_range_display,
            extracted_markdown=full_markdown,
            extracted_text=full_extracted_text,
            subject=subject,
            topic=topic,
            pages=pages_extracted,
            has_math=has_any_math,
            has_scanned_pages=has_any_scanned,
            download_url=f"/api/pdf/{doc_id}/download",
            markdown_download_url=f"/api/pdf/{doc_id}/markdown",
            created_at=now_iso
        )

        return response, str(saved_file_path)


pdf_service = PdfService()

