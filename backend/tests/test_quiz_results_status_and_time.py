import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.storage_service import store
from app.schemas.quiz import QuestionItem

client = TestClient(app)

def test_quiz_submit_status_tiers_and_time_taken():
    """
    Test the exact requirements:
    - 80% to 100%: EXCELLENT (e.g. 9/10 -> 90% EXCELLENT, 10/10 -> 100% EXCELLENT)
    - 60% to 79%: GOOD (e.g. 7/10 -> 70% GOOD)
    - Below 60%: REVIEW (e.g. 3/10 -> 30% REVIEW)
    - Accurate time_taken_seconds persisted and returned (e.g. 155s -> 2 mins 35 seconds)
    """
    quiz_id = "test-quiz-status-tiers"
    questions = [
        QuestionItem(
            id=f"tier-q-{i}",
            question=f"Question {i}?",
            options=["A", "B", "C", "D"],
            correct_index=0,
            explanation=f"Explanation for question {i}",
            topic_tag="Core Concept"
        )
        for i in range(10)
    ]

    store.store_quiz(
        quiz_id=quiz_id,
        title="Status Tiers Assessment",
        subject="AI & ML",
        topic="Model Evaluation",
        difficulty="medium",
        questions=questions
    )

    # 1. 9 out of 10 correct: 90% -> EXCELLENT
    # Time taken: 155 seconds (02:35)
    answers_90 = {f"tier-q-{i}": 0 for i in range(9)}
    answers_90["tier-q-9"] = 1 # 1 wrong answer

    res_90 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": answers_90,
        "time_taken_seconds": 155
    })
    assert res_90.status_code == 200
    d_90 = res_90.json()
    assert d_90["correct_count"] == 9
    assert d_90["total_questions"] == 10
    assert d_90["score_percentage"] == 90.0
    assert d_90["status"] == "EXCELLENT"
    assert d_90["passed"] is True
    assert d_90["time_taken_seconds"] == 155

    # 2. 7 out of 10 correct: 70% -> GOOD
    answers_70 = {f"tier-q-{i}": 0 for i in range(7)}
    for i in range(7, 10):
        answers_70[f"tier-q-{i}"] = 2 # 3 wrong answers

    res_70 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": answers_70,
        "time_taken_seconds": 95
    })
    assert res_70.status_code == 200
    d_70 = res_70.json()
    assert d_70["correct_count"] == 7
    assert d_70["total_questions"] == 10
    assert d_70["score_percentage"] == 70.0
    assert d_70["status"] == "GOOD"
    assert d_70["passed"] is True
    assert d_70["time_taken_seconds"] == 95

    # 3. 3 out of 10 correct: 30% -> REVIEW
    answers_30 = {f"tier-q-{i}": 0 for i in range(3)}
    for i in range(3, 10):
        answers_30[f"tier-q-{i}"] = 3 # 7 wrong answers

    res_30 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": answers_30,
        "time_taken_seconds": 45
    })
    assert res_30.status_code == 200
    d_30 = res_30.json()
    assert d_30["correct_count"] == 3
    assert d_30["total_questions"] == 10
    assert d_30["score_percentage"] == 30.0
    assert d_30["status"] == "REVIEW"
    assert d_30["passed"] is False
    assert d_30["time_taken_seconds"] == 45


def test_boundary_scores_and_unanswered():
    """
    Test boundary scores:
    - 80% (8/10) -> EXCELLENT
    - 60% (6/10) -> GOOD
    - 50% (5/10) -> REVIEW
    - Unanswered questions handled correctly
    """
    quiz_id = "test-quiz-boundary"
    questions = [
        QuestionItem(
            id=f"b-q-{i}",
            question=f"Boundary Question {i}?",
            options=["A", "B", "C", "D"],
            correct_index=1,
            explanation=f"Boundary explanation {i}",
            topic_tag="Boundary Checks"
        )
        for i in range(10)
    ]

    store.store_quiz(
        quiz_id=quiz_id,
        title="Boundary Assessment",
        subject="Mathematics",
        topic="Calculus",
        difficulty="hard",
        questions=questions
    )

    # 80% boundary -> EXCELLENT
    res_80 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": {f"b-q-{i}": 1 for i in range(8)}, # 8 correct, 2 unanswered
        "time_taken_seconds": 120
    })
    assert res_80.status_code == 200
    d_80 = res_80.json()
    assert d_80["score_percentage"] == 80.0
    assert d_80["status"] == "EXCELLENT"

    # 60% boundary -> GOOD
    res_60 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": {f"b-q-{i}": 1 for i in range(6)}, # 6 correct, 4 unanswered
        "time_taken_seconds": 110
    })
    assert res_60.status_code == 200
    d_60 = res_60.json()
    assert d_60["score_percentage"] == 60.0
    assert d_60["status"] == "GOOD"

    # 50% -> REVIEW
    res_50 = client.post("/api/quiz/submit", json={
        "quiz_id": quiz_id,
        "answers": {f"b-q-{i}": 1 for i in range(5)}, # 5 correct, 5 unanswered
        "time_taken_seconds": 60
    })
    assert res_50.status_code == 200
    d_50 = res_50.json()
    assert d_50["score_percentage"] == 50.0
    assert d_50["status"] == "REVIEW"
