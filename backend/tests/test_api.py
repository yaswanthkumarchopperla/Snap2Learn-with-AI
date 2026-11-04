import io
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app.main import app
from app.services.storage_service import store
from app.services.gemini_service import safe_parse_gemini_json


client = TestClient(app)

def test_health_endpoint():
    """Test GET /api/health returns healthy status and features flag."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "features" in data
    assert data["features"]["deterministic_scoring"] is True
    assert "demo_mode_active" in data

def test_image_upload_invalid_type():
    """Test uploading a non-image file returns 400 Bad Request."""
    fake_txt = io.BytesIO(b"Hello world not an image")
    response = client.post(
        "/api/scan",
        files={"file": ("notes.txt", fake_txt, "text/plain")}
    )
    assert response.status_code == 400
    assert "Unsupported file type" in response.json()["detail"]

def test_image_upload_valid_image():
    """Test uploading a valid generated PNG image succeeds with OCR extraction."""
    # Create a small valid test PNG in memory
    img = Image.new("RGB", (100, 100), color=(255, 255, 255))
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)

    response = client.post(
        "/api/scan",
        files={"file": ("test_note.png", img_bytes, "image/png")},
        data={"subject_hint": "Computer Science"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "text" in data
    assert "subject" in data
    assert "confidence" in data

def test_explain_endpoint_validation():
    """Test explain endpoint rejects empty/too short text."""
    response = client.post(
        "/api/explain",
        json={"text": "a", "subject": "Math", "topic": "Calculus", "mode": "standard", "language": "english"}
    )
    assert response.status_code == 422


def test_explain_endpoint_success():
    """Test explain endpoint generates structured explanation with formulas and steps."""
    payload = {
        "text": "Eigenvalues are roots of the characteristic equation det(A - lambda I) = 0.",
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra",
        "mode": "standard",
        "language": "bilingual"
    }
    response = client.post("/api/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["detailed_steps"]) > 0
    assert "key_definitions" in data
    assert "formulas" in data
    assert "exam_answer" in data

def test_quiz_generate_and_deterministic_scoring():
    """Test generating a quiz, then submitting answers and verifying deterministic score calculation."""
    gen_payload = {
        "study_text": "Linear transformations and eigenvalues determine vector scaling without rotation. Det(A - lambda I) = 0.",
        "subject": "Mathematics",
        "topic": "Eigenvalues",
        "num_questions": 5,
        "difficulty": "medium"
    }
    gen_resp = client.post("/api/quiz/generate", json=gen_payload)
    assert gen_resp.status_code == 200
    quiz_data = gen_resp.json()
    quiz_id = quiz_data["quiz_id"]
    questions = quiz_data["questions"]
    assert len(questions) == 5

    # Verify correct_index is NOT leaked to the client in QuestionClientView
    for q in questions:
        assert "correct_index" not in q
        assert len(q["options"]) == 4

    # Submit with answers: question 1 correct, others wrong to verify deterministic math
    # Look up actual correct index from backend store to control test score
    stored_quiz = store.get_quiz(quiz_id)
    assert stored_quiz is not None
    q_list = stored_quiz["questions"]

    # Provide correct answer for question 0, deliberately wrong answer for question 1, 2, 3, 4
    answers_map = {}
    q0 = q_list[0]
    answers_map[q0.id] = q0.correct_index

    for q in q_list[1:]:
        wrong_idx = (q.correct_index + 1) % 4
        answers_map[q.id] = wrong_idx

    submit_resp = client.post(
        "/api/quiz/submit",
        json={
            "quiz_id": quiz_id,
            "answers": answers_map,
            "time_taken_seconds": 45
        }
    )
    assert submit_resp.status_code == 200
    sub_data = submit_resp.json()
    assert sub_data["total_questions"] == 5
    assert sub_data["correct_count"] == 1
    assert sub_data["score_percentage"] == 20.0
    assert sub_data["passed"] is False
    assert len(sub_data["question_reviews"]) == 5
    assert sub_data["question_reviews"][0]["is_correct"] is True
    assert sub_data["question_reviews"][1]["is_correct"] is False
    assert len(sub_data["weak_topics"]) > 0

def test_notes_crud():
    """Test creating, listing, getting, and deleting a note."""
    create_payload = {
        "title": "Data Structures - Binary Trees",
        "subject": "Computer Science",
        "topic": "Trees & Traversal",
        "raw_text": "Inorder traversal visits Left, Root, Right. Preorder visits Root, Left, Right.",
        "summary": "Tree traversal basics"
    }
    create_resp = client.post("/api/notes", json=create_payload)
    assert create_resp.status_code == 200
    note_id = create_resp.json()["id"]

    get_resp = client.get(f"/api/notes/{note_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == create_payload["title"]

    del_resp = client.delete(f"/api/notes/{note_id}")
    assert del_resp.status_code == 200

    get_again = client.get(f"/api/notes/{note_id}")
    assert get_again.status_code == 404

def test_flashcards_and_progress():
    """Test flashcard review and analytics aggregation."""
    # List flashcards
    fc_resp = client.get("/api/flashcards")
    assert fc_resp.status_code == 200
    cards = fc_resp.json()
    assert len(cards) > 0
    first_card = cards[0]

    # Review a card
    rev_resp = client.post(
        f"/api/flashcards/{first_card['id']}/review",
        json={"rating": "easy"}
    )
    assert rev_resp.status_code == 200
    assert rev_resp.json()["difficulty"] == "easy"
    assert rev_resp.json()["review_count"] >= 1

    # Check progress endpoint
    prog_resp = client.get("/api/progress")
    assert prog_resp.status_code == 200
    prog = prog_resp.json()
    assert "average_accuracy" in prog
    assert "quizzes_completed" in prog
    assert "subject_performance" in prog

def test_safe_parse_gemini_json_escapes_and_telugu():
    """Test safe_parse_gemini_json handles invalid backslashes, LaTeX macros, C code escapes, and Telugu."""
    # 1. Raw unescaped LaTeX backslashes (\lambda, \sum, \frac, \text)
    raw_latex = r'{"latex": "\lambda v = \frac{a}{b} + \text{Trace}(A) + \sum_{i=1}^n x_i"}'
    parsed1 = safe_parse_gemini_json(raw_latex)
    assert r"\lambda" in parsed1["latex"]
    assert r"\sum" in parsed1["latex"]
    assert "Trace" in parsed1["latex"]

    # 2. C code escape sequences (\0, \n, \t) and quotes
    raw_c = r'{"code": "char c = \'\0\'; printf(\"Hello\n\");", "desc": "Null-terminated string\texample"}'
    parsed2 = safe_parse_gemini_json(raw_c)
    assert r"\0" in parsed2["code"]
    assert "printf" in parsed2["code"]
    assert "\t" in parsed2["desc"]

    # 3. Telugu unicode text with embedded LaTeX formulas
    raw_telugu = r'{"telugu": "మ్యాట్రిక్స్ A: $A v = \lambda v$, ఐగన్‌విలువలు: \sum \lambda_i = \text{Trace}(A)"}'
    parsed3 = safe_parse_gemini_json(raw_telugu)
    assert "మ్యాట్రిక్స్" in parsed3["telugu"]
    assert r"\lambda" in parsed3["telugu"]

    # 4. Fenced markdown json block
    raw_fenced = "```json\n" + r'{"status": "ok", "formula": "\alpha + \beta"}' + "\n```"
    parsed4 = safe_parse_gemini_json(raw_fenced)
    assert parsed4["status"] == "ok"
    assert r"\alpha" in parsed4["formula"]

def test_c_programming_explanation():
    """Test POST /api/explain with C programming notes (Type Conversion & Operator Precedence) without escape failures."""
    c_payload = {
        "text": (
            "C Programming Notes:\n"
            "1. Implicit Type Conversion (Promotion): char -> int -> float -> double.\n"
            "   Example: int a = 10; float b = 4.5; float res = a + b;\n"
            "2. Explicit Type Casting: (type) expression. Example: (double) sum / count;\n"
            "3. Operator Precedence: () > * / % > + - > =;\n"
        ),
        "subject": "C Programming",
        "topic": "Type Conversion and Operator Precedence",
        "mode": "standard",
        "language": "english"
    }
    response = client.post("/api/explain", json=c_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["subject"] == "C Programming"
    assert len(data["detailed_steps"]) > 0
    assert "short_summary" in data
    # Ensure it's grounded in C programming, NOT eigenvalues
    assert "eigen" not in data["short_summary"].lower()

def test_mathematical_formulas_and_telugu_explanation():
    """Test POST /api/explain with LaTeX mathematical formulas and bilingual Telugu without Invalid \escape."""
    math_payload = {
        "text": (
            "Linear Algebra:\n"
            "Characteristic equation: \\det(A - \\lambda I) = 0.\n"
            "Fundamental relation: A v = \\lambda v (v \\neq 0).\n"
            "Properties: \\sum \\lambda_i = \\text{Trace}(A), \\prod \\lambda_i = \\det(A)."
        ),
        "subject": "Engineering Mathematics",
        "topic": "Eigenvalues & Characteristic Equation",
        "mode": "standard",
        "language": "bilingual"
    }
    response = client.post("/api/explain", json=math_payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["formulas"]) > 0
    assert len(data["detailed_steps"]) > 0
    # Must contain bilingual or Telugu summary
    assert data["telugu_summary"] is not None or any(d.telugu_translation for d in data.get("key_definitions", []))

def test_auth_guest_and_otp_flow():
    """Test guest login, OTP generation, verification, and token authentication."""
    # 1. Guest login
    guest_res = client.post("/api/auth/guest")
    assert guest_res.status_code == 200
    g_data = guest_res.json()
    assert g_data["success"] is True
    assert "token" in g_data
    assert g_data["user"]["is_guest"] is True

    # 2. Test /api/auth/me with guest token
    token = g_data["token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["is_guest"] is True

    # 3. Simulate OTP verification for a student
    test_email = "student_test@example.com"
    store.save_otp(test_email, "987654")
    verify_res = client.post(
        "/api/auth/verify-otp",
        json={"email": test_email, "otp": "987654", "name": "Test Student"}
    )
    assert verify_res.status_code == 200
    v_data = verify_res.json()
    assert v_data["success"] is True
    assert v_data["user"]["email"] == test_email
    assert v_data["user"]["is_guest"] is False

    # 4. Verify invalid OTP fails
    bad_res = client.post(
        "/api/auth/verify-otp",
        json={"email": test_email, "otp": "000000"}
    )
    assert bad_res.status_code == 400


