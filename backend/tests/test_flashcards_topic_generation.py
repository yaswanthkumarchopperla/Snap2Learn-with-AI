import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import create_access_token

client = TestClient(app)

@pytest.fixture
def student_auth_headers():
    user_id = "test-flashcard-student-1"
    token = create_access_token(user_id=user_id, email="flashcard.student@snap2learn.edu", name="Flashcard Tester", is_guest=False)
    return {"Authorization": f"Bearer {token}"}

def test_generate_flashcards_on_topic_and_autosave(student_auth_headers):
    # 1. Request flashcards on a specific topic
    payload = {
        "topic": "Eigenvalues & Characteristic Equation",
        "subject": "Engineering Mathematics",
        "card_count": 5,
        "difficulty_focus": "mixed"
    }
    res = client.post("/api/flashcards/generate", json=payload, headers=student_auth_headers)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["autosaved"] is True
    assert data["count"] == 5
    assert len(data["cards"]) == 5
    assert data["topic"] == "Eigenvalues & Characteristic Equation"
    assert data["subject"] == "Engineering Mathematics"

    # Verify card structure and topic relevance
    first_card = data["cards"][0]
    assert "id" in first_card
    assert first_card["id"].startswith("fc-")
    assert len(first_card["front_prompt"]) > 10
    assert len(first_card["back_answer"]) > 10
    assert first_card["difficulty"] in ["easy", "medium", "hard"]

    # 2. Verify that flashcards are automatically saved in the database
    # and immediately available for revision at any time
    get_res = client.get("/api/flashcards", headers=student_auth_headers)
    assert get_res.status_code == 200
    retrieved_cards = get_res.json()
    assert len(retrieved_cards) >= 5
    retrieved_ids = [c["id"] for c in retrieved_cards]
    assert first_card["id"] in retrieved_ids

def test_generate_flashcards_with_context_notes(student_auth_headers):
    # Generate cards based on scanned notes context
    context = (
        "Let A be a square matrix. The characteristic polynomial is det(A - lambda I) = 0. "
        "The trace equals the sum of eigenvalues and determinant equals product of eigenvalues."
    )
    payload = {
        "topic": "Matrix Properties",
        "subject": "Engineering Mathematics",
        "context_text": context,
        "card_count": 4,
        "difficulty_focus": "easy"
    }
    res = client.post("/api/flashcards/generate", json=payload, headers=student_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["cards"]) == 4

def test_generate_flashcards_empty_topic_rejected(student_auth_headers):
    res = client.post("/api/flashcards/generate", json={"topic": "   "}, headers=student_auth_headers)
    assert res.status_code == 400
    assert "Topic is required" in res.json()["detail"]

def test_revise_flashcard_autosave_lifecycle(student_auth_headers):
    # 1. Generate a flashcard set
    payload = {
        "topic": "Machine Learning Fundamentals",
        "subject": "Machine Learning",
        "card_count": 3
    }
    gen_res = client.post("/api/flashcards/generate", json=payload, headers=student_auth_headers)
    assert gen_res.status_code == 200
    card = gen_res.json()["cards"][0]
    card_id = card["id"]

    # 2. Revise card with "hard" rating (student struggled)
    rev1 = client.post(f"/api/flashcards/{card_id}/review", json={"rating": "hard"})
    assert rev1.status_code == 200
    updated1 = rev1.json()
    assert updated1["difficulty"] == "hard"
    assert updated1["learning_status"] == "unknown"
    assert updated1["review_count"] == 1

    # 3. Revise card again with "easy" rating (mastered)
    rev2 = client.post(f"/api/flashcards/{card_id}/review", json={"rating": "easy"})
    assert rev2.status_code == 200
    updated2 = rev2.json()
    assert updated2["difficulty"] == "easy"
    assert updated2["learning_status"] == "known"
    assert updated2["review_count"] == 2

    # 4. Delete the card when completed
    del_res = client.delete(f"/api/flashcards/{card_id}", headers=student_auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # 5. Subsequent delete should return 404
    del_res_again = client.delete(f"/api/flashcards/{card_id}", headers=student_auth_headers)
    assert del_res_again.status_code == 404
