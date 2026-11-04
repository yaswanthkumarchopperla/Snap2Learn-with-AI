import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.schemas.quiz import (
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuestionClientView,
    QuestionReview
)
from app.services.gemini_service import gemini_service
from app.services.storage_service import store

router = APIRouter(prefix="/quiz", tags=["Quiz Arena"])

@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz(request: QuizGenerateRequest):
    """
    Generates high-quality MCQ quiz questions from confirmed study notes.
    Stores the answer key securely on the backend so client cannot inspect correct answers beforehand.
    """
    if len(request.study_text.strip()) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study text must contain at least 10 characters to generate a meaningful quiz."
        )

    # 1. Generate questions
    questions = gemini_service.generate_quiz_questions(
        study_text=request.study_text,
        subject=request.subject,
        topic=request.topic,
        num_questions=request.num_questions,
        difficulty=request.difficulty
    )

    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not generate quiz questions from provided text."
        )

    # 2. Assign unique ID and store on server
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

    # 3. Strip correct_index and explanation for client integrity
    client_questions = [
        QuestionClientView(
            id=q.id,
            question=q.question,
            options=q.options,
            topic_tag=q.topic_tag
        )
        for q in questions
    ]

    return QuizGenerateResponse(
        quiz_id=quiz_id,
        title=title,
        subject=request.subject,
        topic=request.topic,
        difficulty=request.difficulty,
        total_questions=len(client_questions),
        questions=client_questions,
        is_demo=not gemini_service.is_available
    )

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(request: QuizSubmitRequest):
    """
    Deterministically computes score on backend, analyzes mistakes, and records attempt into analytics.
    """
    quiz_data = store.get_quiz(request.quiz_id)
    if not quiz_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz session '{request.quiz_id}' not found or expired."
        )

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

    # Record into student analytics
    store.record_attempt({
        "quiz_id": request.quiz_id,
        "subject": quiz_data["subject"],
        "topic": quiz_data["topic"],
        "total_questions": total_questions,
        "correct_count": correct_count,
        "score_percentage": score_pct,
        "passed": passed,
        "time_taken_seconds": request.time_taken_seconds,
        "weak_topics": weak_topics,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return QuizSubmitResponse(
        quiz_id=request.quiz_id,
        total_questions=total_questions,
        correct_count=correct_count,
        score_percentage=score_pct,
        passed=passed,
        time_taken_seconds=request.time_taken_seconds,
        question_reviews=question_reviews,
        weak_topics=weak_topics,
        revision_recommendation=revision_rec
    )
