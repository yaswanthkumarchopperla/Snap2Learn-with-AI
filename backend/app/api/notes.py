from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from app.schemas.note import NoteItem, NoteCreate
from app.services.storage_service import store

router = APIRouter(prefix="/notes", tags=["My Notes"])

@router.get("", response_model=List[NoteItem])
def list_notes(subject: Optional[str] = None):
    """List all saved study notes with optional subject filter."""
    notes = store.get_notes()
    if subject and subject.lower() != "all":
        notes = [n for n in notes if n.subject.lower() == subject.lower()]
    return notes

@router.get("/{note_id}", response_model=NoteItem)
def get_single_note(note_id: str):
    """Retrieve details of a specific saved note."""
    note = store.get_note(note_id)
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID '{note_id}' not found."
        )
    return note

@router.post("", response_model=NoteItem)
def create_note(data: NoteCreate):
    """Save a new extracted or created study note."""
    if not data.title.strip() or not data.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and raw text are required."
        )
    note = store.save_note(
        title=data.title,
        subject=data.subject,
        topic=data.topic,
        raw_text=data.raw_text,
        summary=data.summary
    )
    return note

@router.delete("/{note_id}")
def delete_note(note_id: str):
    """Delete a saved note."""
    deleted = store.delete_note(note_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note with ID '{note_id}' not found."
        )
    return {"status": "success", "message": f"Note '{note_id}' deleted successfully."}
