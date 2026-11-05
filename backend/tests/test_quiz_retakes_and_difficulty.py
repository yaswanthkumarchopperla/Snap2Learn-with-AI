import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.storage_service import store
from app.services.gemini_service import gemini_service
from app.services.quiz_service import (
    compute_question_fingerprint,
    are_questions_duplicate,
    deduplicate_quiz_batch
)
from app.schemas.quiz import QuestionItem
from app.api.auth import create_access_token

client = TestClient(app)

def create_student_headers(user_id: str, email: str, name: str) -> dict:
    token = create_access_token(user_id, email, name, is_guest=False)
    return {"Authorization": f"Bearer {token}"}

STUDENT_A_HEADERS = create_student_headers("student_alice_01", "alice@college.edu", "Alice")
STUDENT_B_HEADERS = create_student_headers("student_bob_02", "bob@college.edu", "Bob")

SAMPLE_STUDY_TEXT = """
Let A be an n x n square matrix. A scalar lambda is called an eigenvalue of A if there exists a non-zero column vector v such that A v = lambda v.
The vector v is the associated eigenvector.
The characteristic equation is given by det(A - lambda I) = 0.
The roots of the characteristic polynomial are the eigenvalues of matrix A.
The trace of matrix A is the sum of main diagonal elements, and equals the sum of all eigenvalues: sum(lambda_i) = Trace(A).
The determinant of matrix A equals the product of all eigenvalues: prod(lambda_i) = det(A).
If lambda = 0 is an eigenvalue of A, then det(A) = 0 and matrix A is singular and non-invertible.
For an identity matrix I_n, all eigenvalues are equal to 1.
For any real orthogonal matrix Q (Q^T Q = I), the magnitude of every eigenvalue satisfies |lambda| = 1.
According to the Cayley-Hamilton theorem, every square matrix satisfies its own characteristic polynomial equation p(A) = 0.
"""

# =====================================================================
# TEST 1: Easy Quiz - Complete & Retake generates different questions
# =====================================================================
def test_scenario_1_easy_quiz_retake_generates_fresh_questions():
    """TEST 1: Generate Easy quiz (5 Qs). Complete it and retake it. Verify new quiz contains different questions."""
    payload = {
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "easy",
        "is_retake": False
    }
    # 1. Generate First Attempt
    res1 = client.post("/api/quiz/generate", json=payload, headers=STUDENT_A_HEADERS)
    assert res1.status_code == 200
    data1 = res1.json()
    q_list_1 = data1["questions"]
    assert len(q_list_1) == 5
    q1_fps = {compute_question_fingerprint(q["question"]) for q in q_list_1}

    # 2. Complete and submit Quiz 1
    stored_quiz1 = store.get_quiz(data1["quiz_id"])
    correct_indices = {q.id: q.correct_index for q in stored_quiz1["questions"]}
    submit_payload = {
        "quiz_id": data1["quiz_id"],
        "answers": correct_indices,
        "time_taken_seconds": 45
    }
    sub_res = client.post("/api/quiz/submit", json=submit_payload, headers=STUDENT_A_HEADERS)
    assert sub_res.status_code == 200

    # 3. Retake Quiz with is_retake = True
    retake_payload = {
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "easy",
        "is_retake": True
    }
    res2 = client.post("/api/quiz/generate", json=retake_payload, headers=STUDENT_A_HEADERS)
    assert res2.status_code == 200
    data2 = res2.json()
    q_list_2 = data2["questions"]
    assert len(q_list_2) == 5

    # 4. Verify Quiz 2 contains fresh questions not in Quiz 1
    q2_fps = {compute_question_fingerprint(q["question"]) for q in q_list_2}
    
    # Check that fresh questions appeared
    fresh_count = len(q2_fps - q1_fps)
    assert fresh_count > 0, "Retake quiz must introduce fresh questions and not repeat the identical first set"

    # Verify each question in retake is not a paraphrase duplicate of the corresponding index in quiz 1
    for q_new in q_list_2:
        for q_old in q_list_1:
            if q_new["id"] != q_old["id"]:
                assert not are_questions_duplicate(q_new["question"], q_old["question"]), (
                    f"Retake generated duplicate/paraphrased question: '{q_new['question']}' vs '{q_old['question']}'"
                )

# =====================================================================
# TEST 2: Easy vs Medium Comparison - Meaningfully Different
# =====================================================================
def test_scenario_2_separate_easy_and_medium_levels():
    """TEST 2: Generate Medium quiz on same topic. Compare with Easy. Verify questions are meaningfully different and more challenging."""
    easy_res = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "easy"
    }, headers=create_student_headers("diff_tester_01", "diff1@test.com", "Tester 1"))
    assert easy_res.status_code == 200
    easy_qs = easy_res.json()["questions"]

    medium_res = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "medium"
    }, headers=create_student_headers("diff_tester_02", "diff2@test.com", "Tester 2"))
    assert medium_res.status_code == 200
    medium_qs = medium_res.json()["questions"]

    easy_stems = [q["question"] for q in easy_qs]
    medium_stems = [q["question"] for q in medium_qs]

    # Verify Easy and Medium question sets do not produce identical questions
    for m_stem in medium_stems:
        for e_stem in easy_stems:
            assert not are_questions_duplicate(m_stem, e_stem), (
                f"Easy and Medium generated duplicate question: '{m_stem}' vs '{e_stem}'"
            )

    # Verify Medium questions test application/calculations/theorems
    # (e.g. Cayley-Hamilton, eigenvalue calculation, inverse matrix, transpose)
    medium_blob = " ".join(medium_stems).lower()
    assert any(term in medium_blob for term in ["trace", "calculation", "inverse", "cayley-hamilton", "powers", "transpose", "upper triangular"])

# =====================================================================
# TEST 3: Hard Quiz - Requires Deeper Analytical Reasoning
# =====================================================================
def test_scenario_3_hard_quiz_deep_reasoning():
    """TEST 3: Generate a Hard quiz. Verify questions require deeper reasoning and analysis."""
    hard_res = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "hard"
    }, headers=create_student_headers("hard_tester_01", "hard@test.com", "Hard Tester"))
    assert hard_res.status_code == 200
    hard_qs = hard_res.json()["questions"]
    assert len(hard_qs) == 5

    hard_blob = " ".join([q["question"] for q in hard_qs]).lower()
    
    # Hard questions must address advanced concepts (spectral mapping, orthogonal matrix, defectiveness, Rayleigh quotient, etc.)
    has_advanced_concept = any(
        kw in hard_blob for kw in [
            "polynomial", "spectral", "orthogonal", "rayleigh", "defective", "radius", "multiplicity"
        ]
    )
    assert has_advanced_concept, "Hard quiz must test advanced analytical problems or multi-step reasoning"

# =====================================================================
# TEST 4: Prevent Duplicate Questions within Quiz & Similarity
# =====================================================================
def test_scenario_4_prevent_duplicate_questions():
    """TEST 4: Check for exact and near-duplicate question detection."""
    # 1. Unit test the duplicate detection engine
    exact_q1 = "Which determinant equation gives the characteristic equation of matrix A?"
    paraphrase_q2 = "What is the characteristic equation used to find eigenvalues of matrix A?"
    assert are_questions_duplicate(exact_q1, paraphrase_q2) is True

    # 2. Distinct questions on the same subject must NOT be falsely marked as duplicates
    distinct_q1 = "The product of all eigenvalues of a matrix A equals:"
    distinct_q2 = "The sum of all eigenvalues of an n x n matrix is always equal to:"
    assert are_questions_duplicate(distinct_q1, distinct_q2) is False

    # 3. Deduplication of batch with an injected duplicate
    test_items = [
        QuestionItem(
            id="t1", question="What is an eigenvector?", options=["A", "B", "C", "D"], correct_index=0, explanation="Exp", topic_tag="Tag"
        ),
        QuestionItem(
            id="t2", question="What is the definition of an eigenvector?", options=["A", "B", "C", "D"], correct_index=0, explanation="Exp", topic_tag="Tag"
        ),
        QuestionItem(
            id="t3", question="What are the eigenvalues of an identity matrix?", options=["A", "B", "C", "D"], correct_index=0, explanation="Exp", topic_tag="Tag"
        ),
    ]
    deduped = deduplicate_quiz_batch(test_items)
    assert len(deduped) == 2, "Batch deduplication must remove paraphrased duplicates"
    assert deduped[0].id == "t1"
    assert deduped[1].id == "t3"

# =====================================================================
# TEST 5: Complete with Low Score & Retake - Prior Score Preserved
# =====================================================================
def test_scenario_5_low_score_attempt_preserved_and_recorded_separately():
    """TEST 5: Complete quiz with low score and retake it. Verify previous score remains saved and new attempt recorded separately."""
    student_id = "failing_student_99"
    headers = create_student_headers(student_id, "student99@college.edu", "Charlie")

    # 1. Generate Quiz Attempt 1
    gen_res = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "medium"
    }, headers=headers)
    assert gen_res.status_code == 200
    quiz1 = gen_res.json()
    quiz1_id = quiz1["quiz_id"]

    # 2. Submit intentionally wrong answers (score = 0.0%)
    sub_res_1 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz1_id,
        "answers": {q["id"]: 999 for q in quiz1["questions"]},
        "time_taken_seconds": 60
    }, headers=headers)
    assert sub_res_1.status_code == 200
    result1 = sub_res_1.json()
    assert result1["score_percentage"] == 0.0
    assert result1["passed"] is False

    # 3. Retake the quiz
    retake_gen_res = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "medium",
        "is_retake": True
    }, headers=headers)
    assert retake_gen_res.status_code == 200
    quiz2 = retake_gen_res.json()
    quiz2_id = quiz2["quiz_id"]
    assert quiz2_id != quiz1_id, "New attempt must have its own distinct quiz session ID"

    # 4. Submit correct answers on retake
    stored_quiz2 = store.get_quiz(quiz2_id)
    correct_answers = {q.id: q.correct_index for q in stored_quiz2["questions"]}
    sub_res_2 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz2_id,
        "answers": correct_answers,
        "time_taken_seconds": 50
    }, headers=headers)
    assert sub_res_2.status_code == 200
    result2 = sub_res_2.json()
    assert result2["score_percentage"] == 100.0
    assert result2["passed"] is True

    # 5. Verify that store preserves BOTH attempts independently
    all_student_attempts = store.get_attempts(student_id)
    quiz_ids = [a["quiz_id"] for a in all_student_attempts]
    assert quiz1_id in quiz_ids, "Original low-scoring quiz attempt must be preserved"
    assert quiz2_id in quiz_ids, "New retake attempt must be saved separately"

    attempt_1 = next(a for a in all_student_attempts if a["quiz_id"] == quiz1_id)
    attempt_2 = next(a for a in all_student_attempts if a["quiz_id"] == quiz2_id)
    assert attempt_1["score_percentage"] == 0.0
    assert attempt_2["score_percentage"] == 100.0

# =====================================================================
# TEST 6: Fallback System Variety & Notice
# =====================================================================
def test_scenario_6_fallback_mode_variety_and_notice():
    """TEST 6: Test system when Gemini is unavailable; verify fallback questions do not repeatedly appear without variety."""
    student_id = "fallback_student_77"
    headers = create_student_headers(student_id, "fallback@test.com", "Fallback User")

    # Initial offline attempt
    res1 = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "easy"
    }, headers=headers)
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["is_demo"] is True
    assert len(d1["questions"]) == 5

    # Submit attempt to register question history
    client.post("/api/quiz/submit", json={
        "quiz_id": d1["quiz_id"],
        "answers": {},
        "time_taken_seconds": 30
    }, headers=headers)

    # Retake 1 in fallback
    res2 = client.post("/api/quiz/generate", json={
        "study_text": SAMPLE_STUDY_TEXT,
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra & Matrices",
        "num_questions": 5,
        "difficulty": "easy",
        "is_retake": True
    }, headers=headers)
    assert res2.status_code == 200
    d2 = res2.json()

    # The 6th question in the bank is picked, and notice is provided if the bank cycles
    fps_1 = {compute_question_fingerprint(q["question"]) for q in d1["questions"]}
    fps_2 = {compute_question_fingerprint(q["question"]) for q in d2["questions"]}
    
    # Verify that a fresh question (math-easy-6 or math-easy-7) was introduced
    has_fresh_unseen = len(fps_2 - fps_1) > 0
    assert has_fresh_unseen, "Fallback mode must not repeatedly return the exact same 5 questions when additional questions exist"

# =====================================================================
# TEST 7: Student Question History Isolation
# =====================================================================
def test_scenario_7_separate_student_question_histories():
    """TEST 7: Verify that two different students have completely separate question histories."""
    alice_id = "student_alice_distinct"
    bob_id = "student_bob_distinct"
    alice_headers = create_student_headers(alice_id, "alice.d@test.com", "Alice D")
    bob_headers = create_student_headers(bob_id, "bob.d@test.com", "Bob D")

    topic = "Convolutional Neural Networks"

    # Alice takes a quiz on CNN
    alice_gen = client.post("/api/quiz/generate", json={
        "study_text": "Convolutional Neural Networks use conv layers and max pooling.",
        "subject": "Machine Learning",
        "topic": topic,
        "num_questions": 5,
        "difficulty": "medium"
    }, headers=alice_headers)
    assert alice_gen.status_code == 200
    alice_quiz = alice_gen.json()

    # Alice submits it
    client.post("/api/quiz/submit", json={
        "quiz_id": alice_quiz["quiz_id"],
        "answers": {},
        "time_taken_seconds": 40
    }, headers=alice_headers)

    # Check Alice's recorded fingerprints
    alice_fps = store.get_user_attempted_fingerprints(alice_id, topic)
    assert len(alice_fps) == 5

    # Check Bob's recorded fingerprints on the same topic
    bob_fps = store.get_user_attempted_fingerprints(bob_id, topic)
    assert len(bob_fps) == 0, "Bob's question history must be completely empty initially, zero leakage from Alice"
