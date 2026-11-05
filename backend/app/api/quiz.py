import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuizProgressRequest,
    ActiveQuizResponse,
    QuestionClientView,
    QuestionReview
)
from app.api.auth import AuthUserResponse, get_optional_current_user
from app.services.gemini_service import gemini_service
from app.services.storage_service import store

router = APIRouter(prefix="/quiz", tags=["Quiz Arena"])

@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz(
    request: QuizGenerateRequest,
    user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Generates high-quality MCQ quiz questions from confirmed study notes.
    Stores the answer key securely on the backend so client cannot inspect correct answers beforehand.
    Prevents duplicates within the quiz and guarantees fresh questions on retakes.
    """
    if len(request.study_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study text must contain at least 10 characters to generate a meaningful quiz."
        )

    # 1. Resolve student identity for partitioned history tracking
    student_id = user.id if user else (request.user_id or "guest_student")

    # 2. Retrieve student's attempted question fingerprints and stems on this topic
    attempted_fps = store.get_user_attempted_fingerprints(student_id, request.topic)
    attempted_stems = store.get_user_attempted_question_stems(student_id, request.topic)

    # 3. Generate questions with duplicate detection & retake exclusion
    questions, is_demo, notice = gemini_service.generate_quiz_questions_with_dedup(
        study_text=request.study_text,
        subject=request.subject,
        topic=request.topic,
        num_questions=request.num_questions,
        difficulty=request.difficulty,
        excluded_fingerprints=attempted_fps,
        excluded_stems=attempted_stems,
        is_retake=request.is_retake
    )

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate quiz questions from provided text."
        )

    # 4. Assign unique ID and store on server
    quiz_id = f"quiz-{uuid.uuid4().hex[:10]}"
    title = f"{request.topic} - {request.difficulty.capitalize()} Assessment"

    store.store_quiz(
        quiz_id=quiz_id,
        title=title,
        subject=request.subject,
        topic=request.topic,
        difficulty=request.difficulty,
        questions=questions
    )

    # 5. Strip correct_index and explanation for client integrity
    client_questions = [
        QuestionClientView(
            id=q.id,
            question=q.question,
            options=q.options,
            topic_tag=q.topic_tag
        )
        for q in questions
    ]

    # 6. Initialize active quiz progress record for auto-saving and recovery
    store.save_quiz_progress(
        quiz_id=quiz_id,
        answers={},
        current_question_index=0,
        time_taken_seconds=0,
        is_completed=False,
        user_id=student_id,
        quiz_meta={
            "title": title,
            "subject": request.subject,
            "topic": request.topic,
            "difficulty": request.difficulty,
            "total_questions": len(client_questions),
            "questions": [q.model_dump() for q in client_questions]
        }
    )

    return QuizGenerateResponse(
        quiz_id=quiz_id,
        title=title,
        subject=request.subject,
        topic=request.topic,
        difficulty=request.difficulty,
        total_questions=len(client_questions),
        questions=client_questions,
        is_demo=is_demo,
        is_fresh_retake=True,
        notice=notice
    )

@router.post("/{quiz_id}/progress")
def save_quiz_progress(
    quiz_id: str,
    request: QuizProgressRequest,
    user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Autosave quiz state immediately upon option selection or navigation.
    Preserves selected answers, timer position, and current question.
    """
    student_id = user.id if user else (request.user_id or "guest_student")
    meta = {}
    if request.questions:
        meta["questions"] = [q.model_dump() for q in request.questions]
    if request.title:
        meta["title"] = request.title
    if request.subject:
        meta["subject"] = request.subject
    if request.topic:
        meta["topic"] = request.topic
    if request.difficulty:
        meta["difficulty"] = request.difficulty
    if request.total_questions:
        meta["total_questions"] = request.total_questions

    saved = store.save_quiz_progress(
        quiz_id=quiz_id,
        answers=request.answers,
        current_question_index=request.current_question_index,
        time_taken_seconds=request.time_taken_seconds,
        is_completed=request.is_completed,
        user_id=student_id,
        quiz_meta=meta if meta else None
    )
    return {"status": "saved", "quiz_id": quiz_id, "updated_at": saved.get("updated_at")}

@router.get("/active", response_model=ActiveQuizResponse)
def get_active_quiz(user: Optional[AuthUserResponse] = Depends(get_optional_current_user)):
    """
    Checks if there is an in-progress, unfinished quiz for the student.
    Enables automatic restoration across browser refreshes or device changes.
    """
    student_id = user.id if user else "guest_student"
    active = store.get_active_quiz(user_id=student_id)
    if not active:
        return ActiveQuizResponse(has_active_quiz=False)

    raw_questions = active.get("questions", [])
    client_questions = []
    for q in raw_questions:
        try:
            if isinstance(q, dict):
                client_questions.append(QuestionClientView(**q))
            elif hasattr(q, "model_dump"):
                client_questions.append(QuestionClientView(**q.model_dump()))
        except Exception:
            pass

    return ActiveQuizResponse(
        has_active_quiz=True,
        quiz_id=active.get("quiz_id"),
        title=active.get("title"),
        subject=active.get("subject"),
        topic=active.get("topic"),
        difficulty=active.get("difficulty"),
        total_questions=active.get("total_questions", len(client_questions)),
        questions=client_questions,
        answers=active.get("answers", {}),
        current_question_index=active.get("current_question_index", 0),
        time_taken_seconds=active.get("time_taken_seconds", 0),
        is_completed=active.get("is_completed", False),
        updated_at=active.get("updated_at")
    )

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    request: QuizSubmitRequest,
    user: Optional[AuthUserResponse] = Depends(get_optional_current_user)
):
    """
    Deterministically computes score on backend, records individual attempt into analytics,
    and updates student question history to guarantee fresh questions on retakes.
    Marks the active quiz session as completed.
    """
    quiz_data = store.get_quiz(request.quiz_id)
    if not quiz_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz session '{request.quiz_id}' not found or expired."
        )

    student_id = user.id if user else (request.user_id or quiz_data.get("user_id", "guest_student"))
    attempt_id = f"att-{uuid.uuid4().hex[:10]}"

    questions = quiz_data["questions"]
    total_questions = len(questions)
    correct_count = 0
    question_reviews: list[QuestionReview] = []
    weak_topics: list[str] = []

    for q in questions:
        selected_idx = request.answers.get(q.id)
        is_correct = (selected_idx is not None and selected_idx == q.correct_index)

        if is_correct:
            correct_count += 1
        else:
            if q.topic_tag and q.topic_tag not in weak_topics:
                weak_topics.append(q.topic_tag)

        question_reviews.append(
            QuestionReview(
                id=q.id,
                question=q.question,
                options=q.options,
                selected_index=selected_idx,
                correct_index=q.correct_index,
                is_correct=is_correct,
                explanation=q.explanation,
                topic_tag=q.topic_tag
            )
        )

    score_pct = round((correct_count / total_questions) * 100, 1) if total_questions > 0 else 0.0
    passed = score_pct >= 60.0

    # Revision recommendations
    if not passed and weak_topics:
        revision_rec = f"Focus on understanding '{weak_topics[0]}' before retaking this quiz."
    elif passed and weak_topics:
        revision_rec = f"Great pass! Review '{weak_topics[0]}' to achieve 100% mastery."
    else:
        revision_rec = "Outstanding performance! You have mastered all concepts in this set."

    # Record into student analytics - saves new attempt separately without overwriting previous scores
    store.record_attempt({
        "attempt_id": attempt_id,
        "quiz_id": request.quiz_id,
        "user_id": student_id,
        "subject": quiz_data["subject"],
        "topic": quiz_data["topic"],
        "difficulty": quiz_data.get("difficulty", "medium"),
        "total_questions": total_questions,
        "correct_count": correct_count,
        "score_percentage": score_pct,
        "passed": passed,
        "time_taken_seconds": request.time_taken_seconds,
        "weak_topics": weak_topics,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Record question history for duplicate detection and retake filtering
    store.record_question_history(
        user_id=student_id,
        quiz_id=request.quiz_id,
        topic=quiz_data["topic"],
        subject=quiz_data["subject"],
        difficulty=quiz_data.get("difficulty", "medium"),
        questions=question_reviews,
        score_percentage=score_pct
    )

    # Mark active quiz progress as completed
    store.complete_quiz_progress(quiz_id=request.quiz_id, user_id=student_id)

    return QuizSubmitResponse(
        quiz_id=request.quiz_id,
        attempt_id=attempt_id,
        total_questions=total_questions,
        correct_count=correct_count,
        score_percentage=score_pct,
        passed=passed,
        time_taken_seconds=request.time_taken_seconds,
        question_reviews=question_reviews,
        weak_topics=weak_topics,
        revision_recommendation=revision_rec
    )
