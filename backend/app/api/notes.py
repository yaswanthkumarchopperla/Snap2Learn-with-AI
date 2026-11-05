from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from app.schemas.note import NoteItem, NoteCreate, NoteUpdate
from app.services.storage_service import store
from app.api.auth import get_optional_current_user, AuthUserResponse

router = APIRouter(prefix="/notes", tags=["My Notes"])

@router.get("", response_model=List[NoteItem])
def list_notes(
    subject: Optional[str] = None,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """List all saved study notes for the authenticated user with optional subject filter."""
    user_id = current_user.id if current_user else "guest_student"
    notes = store.get_notes(user_id=user_id)
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
def create_or_upsert_note(
    data: NoteCreate,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Save or automatically upsert a study note."""
    if not data.title.strip() or not data.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and raw text are required."
        )
    user_id = current_user.id if current_user else "guest_student"
    note = store.save_note(
        title=data.title,
        subject=data.subject,
        topic=data.topic,
        raw_text=data.raw_text,
        summary=data.summary,
        telugu_summary=data.telugu_summary,
        user_id=user_id,
        note_id=data.id
    )
    return note

@router.put("/{note_id}", response_model=NoteItem)
def update_note(
    note_id: str,
    data: NoteUpdate,
    current_user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """Debounced autosave endpoint for modifying an existing note's title, text, or summaries."""
    user_id = current_user.id if current_user else "guest_student"
    updates = data.model_dump(exclude_unset=True)
    updated = store.update_note(note_id=note_id, updates=updates, user_id=user_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note '{note_id}' not found or could not be updated."
        )
    return updated

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
