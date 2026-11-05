import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.auth import create_access_token

client = TestClient(app)

@pytest.fixture
def student_auth_headers():
    user_id = "test-student-autosave-1"
    token = create_access_token(user_id=user_id, email="autosave.student@college.edu", name="Autosave Tester", is_guest=False)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture
def second_student_auth_headers():
    user_id = "test-student-autosave-2"
    token = create_access_token(user_id=user_id, email="student2@college.edu", name="Student Two", is_guest=False)
    return {"Authorization": f"Bearer {token}"}

def test_note_autosave_and_inline_updates(student_auth_headers):
    # 1. Create a note (autosave initial content)
    payload = {
        "title": "Fourier Transform Properties",
        "subject": "Signals & Systems",
        "topic": "Fourier Analysis",
        "raw_text": "The continuous-time Fourier transform represents signals in frequency domain.",
        "summary": "Summary of CTFT",
        "telugu_summary": "సిగ్నల్స్ మరియు సిస్టమ్స్ లో ఫోరియర్ ట్రాన్స్ఫార్మ్"
    }
    res = client.post("/api/notes", json=payload, headers=student_auth_headers)
    assert res.status_code == 200
    created = res.json()
    note_id = created["id"]
    assert created["title"] == payload["title"]
    assert created["user_id"] == "test-student-autosave-1"
    assert created["telugu_summary"] == payload["telugu_summary"]

    # 2. Update note debounced (title and raw_text modified)
    update_payload = {
        "title": "Fourier Transform & Duality Property",
        "raw_text": "Modified raw text with duality property: X(t) <-> 2*pi*x(-w)."
    }
    res_update = client.put(f"/api/notes/{note_id}", json=update_payload, headers=student_auth_headers)
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["title"] == "Fourier Transform & Duality Property"
    assert "duality property" in updated["raw_text"]
    assert updated["telugu_summary"] == payload["telugu_summary"]  # Preserved

    # 3. Retrieve note details
    res_get = client.get(f"/api/notes/{note_id}", headers=student_auth_headers)
    assert res_get.status_code == 200
    assert res_get.json()["title"] == "Fourier Transform & Duality Property"

def test_flashcard_batch_and_status_autosave(student_auth_headers):
    # 1. Batch save flashcards
    batch_payload = {
        "cards": [
            {
                "subject": "Computer Networks",
                "topic": "Transport Layer",
                "front_prompt": "What is the three-way handshake in TCP?",
                "back_answer": "SYN, SYN-ACK, ACK establishing connection.",
                "difficulty": "medium",
                "is_bookmarked": True,
                "learning_status": "learning"
            },
            {
                "subject": "Computer Networks",
                "topic": "Network Layer",
                "front_prompt": "What is CIDR notation?",
                "back_answer": "Classless Inter-Domain Routing representation.",
                "difficulty": "easy",
                "is_bookmarked": False,
                "learning_status": "known"
            }
        ]
    }
    res = client.post("/api/flashcards/batch", json=batch_payload, headers=student_auth_headers)
    assert res.status_code == 200
    cards = res.json()
    assert len(cards) == 2
    card1_id = cards[0]["id"]
    assert cards[0]["is_bookmarked"] is True

    # 2. Update bookmark and learning status
    update_res = client.put(f"/api/flashcards/{card1_id}", json={"is_bookmarked": False, "learning_status": "known"}, headers=student_auth_headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["is_bookmarked"] is False
    assert updated["learning_status"] == "known"

    # 3. Review flashcard
    review_res = client.post(f"/api/flashcards/{card1_id}/review", json={"rating": "easy", "learning_status": "known"}, headers=student_auth_headers)
    assert review_res.status_code == 200
    assert review_res.json()["review_count"] >= 1

def test_quiz_progress_autosave_and_active_restore(student_auth_headers):
    # 1. Generate quiz
    gen_res = client.post("/api/quiz/generate", json={
        "study_text": "Supervised learning uses labeled dataset for model training while unsupervised learning finds hidden patterns without labels.",
        "subject": "Machine Learning",
        "topic": "Supervised vs Unsupervised",
        "num_questions": 5,
        "difficulty": "medium"
    }, headers=student_auth_headers)
    assert gen_res.status_code == 200
    quiz_data = gen_res.json()
    quiz_id = quiz_data["quiz_id"]
    q1_id = quiz_data["questions"][0]["id"]

    # 2. Check active quiz
    active_res = client.get("/api/quiz/active", headers=student_auth_headers)
    assert active_res.status_code == 200
    active = active_res.json()
    assert active["has_active_quiz"] is True
    assert active["quiz_id"] == quiz_id

    # 3. Autosave answer and progress
    progress_res = client.post(f"/api/quiz/{quiz_id}/progress", json={
        "quiz_id": quiz_id,
        "answers": {q1_id: 1},
        "current_question_index": 1,
        "time_taken_seconds": 25,
        "is_completed": False
    }, headers=student_auth_headers)
    assert progress_res.status_code == 200

    # 4. Re-fetch active quiz (simulating page reload or new device)
    active_reloaded = client.get("/api/quiz/active", headers=student_auth_headers).json()
    assert active_reloaded["answers"][q1_id] == 1
    assert active_reloaded["current_question_index"] == 1
    assert active_reloaded["time_taken_seconds"] == 25

    # 5. Submit quiz and verify active quiz is cleared
    submit_res = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": {q1_id: 1},
        "time_taken_seconds": 45
    }, headers=student_auth_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["attempt_id"] != ""

    active_cleared = client.get("/api/quiz/active", headers=student_auth_headers).json()
    assert active_cleared["has_active_quiz"] is False

def test_scan_history_autosave(student_auth_headers):
    import io
    from PIL import Image

    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    res = client.post(
        "/api/scan",
        files={"file": ("notes.png", img_bytes, "image/png")},
        data={"subject_hint": "Control Systems"},
        headers=student_auth_headers
    )
    assert res.status_code == 200
    scan_resp = res.json()
    assert scan_resp["scan_id"] is not None

    # Check scan history
    hist_res = client.get("/api/scan/history", headers=student_auth_headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1
    assert history[0]["id"] == scan_resp["scan_id"]

def test_chat_session_autosave_and_thread_restoration(student_auth_headers):
    # 1. Send first message
    chat_res = client.post("/api/chat", json={
        "message": "Explain Laplace transform region of convergence.",
        "subject": "Signals & Systems",
        "topic": "Laplace Transform"
    }, headers=student_auth_headers)
    assert chat_res.status_code == 200
    reply = chat_res.json()
    session_id = reply["session_id"]
    assert session_id is not None

    # 2. Send follow-up in same session
    chat_res_2 = client.post("/api/chat", json={
        "session_id": session_id,
        "message": "What about stability criteria?",
        "subject": "Signals & Systems",
        "topic": "Laplace Transform"
    }, headers=student_auth_headers)
    assert chat_res_2.status_code == 200
    assert chat_res_2.json()["session_id"] == session_id

    # 3. List sessions
    sessions_res = client.get("/api/chat/sessions", headers=student_auth_headers)
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    found = [s for s in sessions if s["session_id"] == session_id]
    assert len(found) == 1
    assert len(found[0]["messages"]) == 4  # 2 user messages + 2 model replies

    # 4. Get single session
    single_res = client.get(f"/api/chat/sessions/{session_id}", headers=student_auth_headers)
    assert single_res.status_code == 200
    assert len(single_res.json()["messages"]) == 4

def test_user_preferences_autosave(student_auth_headers):
    # 1. Get default preferences
    pref_res = client.get("/api/auth/preferences", headers=student_auth_headers)
    assert pref_res.status_code == 200
    pref = pref_res.json()
    assert pref["preferred_language"] == "en"

    # 2. Autosave updated preferences
    update_res = client.put("/api/auth/preferences", json={
        "preferred_language": "te",
        "default_difficulty": "hard",
        "default_quiz_questions": 10,
        "study_mode": "exam_cram",
        "theme": "dark",
        "auto_save_enabled": True
    }, headers=student_auth_headers)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["preferred_language"] == "te"
    assert updated["default_difficulty"] == "hard"
    assert updated["default_quiz_questions"] == 10
    assert updated["study_mode"] == "exam_cram"

    # 3. Retrieve to verify persistence
    get_res = client.get("/api/auth/preferences", headers=student_auth_headers)
    assert get_res.json()["preferred_language"] == "te"
    assert get_res.json()["default_difficulty"] == "hard"

def test_progress_analytics_scoped_to_user(student_auth_headers):
    res = client.get("/api/progress", headers=student_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_notes" in data
    assert "quizzes_completed" in data
    assert "average_accuracy" in data
    assert "flashcards_reviewed" in data
