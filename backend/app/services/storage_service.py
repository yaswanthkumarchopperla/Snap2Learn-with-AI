import uuid
import json
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.schemas.note import NoteItem, FlashcardItem, ProgressAnalytics
from app.schemas.quiz import QuestionItem
from app.services.mongodb_service import mongodb_service

logger = logging.getLogger("snap2learn.storage")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
PERSISTENCE_FILE = DATA_DIR / "local_storage.json"


class InMemoryStore:
    def __init__(self):
        self.notes: Dict[str, NoteItem] = {}
        self.quizzes: Dict[str, Dict[str, Any]] = {}
        self.attempts: List[Dict[str, Any]] = []
        self.question_history: Dict[str, List[Dict[str, Any]]] = {}
        self.flashcards: Dict[str, FlashcardItem] = {}
        self.otps: Dict[str, str] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self.reset_tokens: Dict[str, Dict[str, Any]] = {}
        self.scans: List[Dict[str, Any]] = []
        self.chat_sessions: Dict[str, Dict[str, Any]] = {}
        self.quiz_progress: Dict[str, Dict[str, Any]] = {}
        self.user_preferences: Dict[str, Dict[str, Any]] = {}

        if not self._load_from_disk():
            self._seed_initial_data()
            self._save_to_disk()

    def _save_to_disk(self):
        try:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            payload = {
                "notes": {k: v.model_dump() for k, v in self.notes.items()},
                "quizzes": self.quizzes,
                "attempts": self.attempts,
                "question_history": self.question_history,
                "flashcards": {k: v.model_dump() for k, v in self.flashcards.items()},
                "otps": self.otps,
                "users": self.users,
                "reset_tokens": self.reset_tokens,
                "scans": self.scans,
                "chat_sessions": self.chat_sessions,
                "quiz_progress": self.quiz_progress,
                "user_preferences": self.user_preferences,
            }
            # Atomic write
            temp_file = PERSISTENCE_FILE.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            temp_file.replace(PERSISTENCE_FILE)
        except Exception as e:
            logger.warning(f"Could not persist to local disk storage: {e}")

    def _load_from_disk(self) -> bool:
        if not PERSISTENCE_FILE.exists():
            return False
        try:
            with open(PERSISTENCE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            self.notes = {k: NoteItem(**v) for k, v in data.get("notes", {}).items()}
            self.quizzes = data.get("quizzes", {})
            self.attempts = data.get("attempts", [])
            self.question_history = data.get("question_history", {})
            self.flashcards = {k: FlashcardItem(**v) for k, v in data.get("flashcards", {}).items()}
            self.otps = data.get("otps", {})
            self.users = data.get("users", {})
            self.reset_tokens = data.get("reset_tokens", {})
            self.scans = data.get("scans", [])
            self.chat_sessions = data.get("chat_sessions", {})
            self.quiz_progress = data.get("quiz_progress", {})
            self.user_preferences = data.get("user_preferences", {})
            logger.info("Successfully loaded state from local disk persistence.")
            return True
        except Exception as e:
            logger.warning(f"Error loading local disk storage: {e}")
            return False

    def _seed_initial_data(self):
        sample_note = NoteItem(
            id="sample-note-eigen",
            user_id="guest_student",
            title="Eigenvalues & Characteristic Equation",
            subject="Engineering Mathematics",
            topic="Linear Algebra & Matrices",
            raw_text="Let A be an n x n square matrix. A scalar lambda is called an eigenvalue of A if there exists a non-zero vector v such that A v = lambda v. The equation det(A - lambda I) = 0 is called the characteristic equation. Roots of this polynomial are eigenvalues.",
            summary="Definition and properties of eigenvalues, eigenvectors, and characteristic polynomial for n x n square matrices.",
            created_at=datetime.now(timezone.utc).isoformat(),
            quiz_count=1,
            accuracy=80.0
        )
        self.notes[sample_note.id] = sample_note

        sample_note_2 = NoteItem(
            id="sample-note-cnn",
            user_id="guest_student",
            title="CNN Feature Extraction & Pooling",
            subject="Machine Learning",
            topic="Convolutional Neural Networks",
            raw_text="A Convolutional Neural Network (CNN) consists of convolutional layers, activation functions (typically ReLU), and pooling layers (Max Pooling or Average Pooling). Feature maps are generated by convolving filter kernels over input channels.",
            summary="Overview of CNN layer architecture, receptive field, kernel operations, and downsampling with pooling.",
            created_at=datetime.now(timezone.utc).isoformat(),
            quiz_count=2,
            accuracy=75.0
        )
        self.notes[sample_note_2.id] = sample_note_2

        fc1 = FlashcardItem(
            id="fc-1",
            note_id="sample-note-eigen",
            subject="Engineering Mathematics",
            topic="Linear Algebra",
            front_prompt="What is the characteristic equation used to find eigenvalues of matrix A?",
            back_answer="det(A - λI) = 0, where I is the identity matrix of the same dimension and λ represents the scalar eigenvalues.",
            formula_or_code="\\det(A - \\lambda I) = 0",
            difficulty="easy",
            is_bookmarked=False,
            learning_status="known",
            review_count=3,
            next_review=datetime.now(timezone.utc).isoformat()
        )
        fc2 = FlashcardItem(
            id="fc-2",
            note_id="sample-note-cnn",
            subject="Machine Learning",
            topic="Convolutional Neural Networks",
            front_prompt="What is the primary role of Max Pooling in deep convolutional networks?",
            back_answer="Max Pooling reduces the spatial dimensions (height & width) of feature maps, which cuts computational load, provides translation invariance, and controls overfitting.",
            formula_or_code="\\text{Output Size} = \\left\\lfloor \\frac{W - F}{S} \\right\\rfloor + 1",
            difficulty="medium",
            is_bookmarked=True,
            learning_status="learning",
            review_count=2,
            next_review=datetime.now(timezone.utc).isoformat()
        )
        fc3 = FlashcardItem(
            id="fc-3",
            note_id="sample-note-cnn",
            subject="Machine Learning",
            topic="Activation Functions",
            front_prompt="Why is ReLU favored over Sigmoid in deep hidden layers?",
            back_answer="ReLU (Rectified Linear Unit, f(x) = max(0, x)) does not saturate in the positive region, thus mitigating the vanishing gradient problem and enabling significantly faster gradient descent convergence.",
            formula_or_code="f(x) = \\max(0, x)",
            difficulty="medium",
            is_bookmarked=False,
            learning_status="learning",
            review_count=1,
            next_review=datetime.now(timezone.utc).isoformat()
        )
        for fc in [fc1, fc2, fc3]:
            self.flashcards[fc.id] = fc

        self.attempts.append({
            "quiz_id": "seed-quiz-1",
            "user_id": "guest_student",
            "subject": "Engineering Mathematics",
            "topic": "Linear Algebra",
            "total_questions": 5,
            "correct_count": 4,
            "score_percentage": 80.0,
            "passed": True,
            "weak_topics": ["Trace and Determinant relationships"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        self.attempts.append({
            "quiz_id": "seed-quiz-2",
            "user_id": "guest_student",
            "subject": "Machine Learning",
            "topic": "Neural Networks",
            "total_questions": 5,
            "correct_count": 3,
            "score_percentage": 60.0,
            "passed": True,
            "weak_topics": ["Vanishing Gradients in RNNs"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

    # Note operations
    def get_notes(self, user_id: str = "guest_student") -> List[NoteItem]:
        all_notes = list(self.notes.values())
        user_notes = [n for n in all_notes if n.user_id == user_id]
        if not user_notes and user_id != "guest_student":
            # Include guest samples so fresh accounts aren't completely empty initially
            user_notes = [n for n in all_notes if n.user_id in (user_id, "guest_student")]
        return sorted(user_notes, key=lambda n: n.created_at, reverse=True)

    def get_note(self, note_id: str) -> Optional[NoteItem]:
        return self.notes.get(note_id)

    def save_note(
        self,
        title: str,
        subject: str,
        topic: str,
        raw_text: str,
        summary: Optional[str] = None,
        telugu_summary: Optional[str] = None,
        user_id: str = "guest_student",
        note_id: Optional[str] = None
    ) -> NoteItem:
        if not note_id:
            note_id = f"note-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        existing = self.notes.get(note_id)
        created_at = existing.created_at if existing else now_iso
        quiz_count = existing.quiz_count if existing else 0
        accuracy = existing.accuracy if existing else 0.0

        note = NoteItem(
            id=note_id,
            user_id=user_id,
            title=title,
            subject=subject,
            topic=topic,
            raw_text=raw_text,
            summary=summary,
            telugu_summary=telugu_summary,
            created_at=created_at,
            updated_at=now_iso,
            quiz_count=quiz_count,
            accuracy=accuracy
        )
        self.notes[note_id] = note
        self._save_to_disk()
        return note

    def update_note(self, note_id: str, updates: Dict[str, Any], user_id: Optional[str] = None) -> Optional[NoteItem]:
        if note_id not in self.notes:
            return None
        existing = self.notes[note_id]
        if user_id and existing.user_id not in (user_id, "guest_student"):
            return None
        data = existing.model_dump()
        for k, v in updates.items():
            if v is not None and k not in ("id", "user_id", "created_at"):
                data[k] = v
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated = NoteItem(**data)
        self.notes[note_id] = updated
        self._save_to_disk()
        return updated

    def delete_note(self, note_id: str) -> bool:
        if note_id in self.notes:
            del self.notes[note_id]
            self._save_to_disk()
            return True
        return False

    # Quiz operations
    def store_quiz(self, quiz_id: str, title: str, subject: str, topic: str, difficulty: str, questions: List[QuestionItem]):
        self.quizzes[quiz_id] = {
            "quiz_id": quiz_id,
            "title": title,
            "subject": subject,
            "topic": topic,
            "difficulty": difficulty,
            "questions": questions,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self._save_to_disk()

    def get_quiz(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        return self.quizzes.get(quiz_id)

    def record_attempt(self, attempt_data: Dict[str, Any]):
        attempt_copy = dict(attempt_data)
        if "timestamp" not in attempt_copy:
            attempt_copy["timestamp"] = datetime.now(timezone.utc).isoformat()
        self.attempts.append(attempt_copy)
        self._save_to_disk()

    def get_attempts(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if not user_id:
            return list(reversed(self.attempts))
        return [a for a in reversed(self.attempts) if a.get("user_id") in (user_id, "guest_student")]

    def record_question_history(
        self,
        user_id: str,
        quiz_id: str,
        topic: str,
        subject: str,
        difficulty: str,
        questions: List[Any],
        score_percentage: float
    ):
        from app.services.quiz_service import compute_question_fingerprint
        now_iso = datetime.now(timezone.utc).isoformat()
        if user_id not in self.question_history:
            self.question_history[user_id] = []
        for q in questions:
            q_text = q.get("question", "") if isinstance(q, dict) else getattr(q, "question", "")
            q_id = q.get("id", "") if isinstance(q, dict) else getattr(q, "id", "")
            is_correct = q.get("is_correct", False) if isinstance(q, dict) else getattr(q, "is_correct", False)
            fp = compute_question_fingerprint(q_text)
            self.question_history[user_id].append({
                "user_id": user_id,
                "quiz_id": quiz_id,
                "question_id": q_id,
                "topic": topic,
                "subject": subject,
                "difficulty": difficulty,
                "question_text": q_text,
                "fingerprint": fp,
                "is_correct": is_correct,
                "score_percentage": score_percentage,
                "created_at": now_iso
            })
        self._save_to_disk()

    def get_user_attempted_fingerprints(self, user_id: str, topic: Optional[str] = None) -> set:
        history = self.question_history.get(user_id, [])
        if topic:
            history = [h for h in history if h.get("topic") == topic]
        return {h["fingerprint"] for h in history if "fingerprint" in h}

    def get_user_attempted_question_stems(self, user_id: str, topic: Optional[str] = None, limit: int = 50) -> List[str]:
        history = self.question_history.get(user_id, [])
        if topic:
            history = [h for h in history if h.get("topic") == topic]
        return [h["question_text"] for h in reversed(history)][:limit]

    # Flashcard operations
    def get_flashcards(self, subject: Optional[str] = None, user_id: str = "guest_student") -> List[FlashcardItem]:
        cards = list(self.flashcards.values())
        user_cards = [c for c in cards if c.user_id in (user_id, "guest_student")]
        if subject and subject.lower() != "all":
            user_cards = [c for c in user_cards if c.subject.lower() == subject.lower()]
        return user_cards

    def add_flashcard(
        self,
        subject: str,
        topic: str,
        front: str,
        back: str,
        formula_or_code: Optional[str] = None,
        difficulty: str = "medium",
        is_bookmarked: bool = False,
        learning_status: str = "learning",
        note_id: Optional[str] = None,
        user_id: str = "guest_student",
        card_id: Optional[str] = None
    ) -> FlashcardItem:
        if not card_id:
            card_id = f"fc-{uuid.uuid4().hex[:8]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        fc = FlashcardItem(
            id=card_id,
            user_id=user_id,
            note_id=note_id,
            subject=subject,
            topic=topic,
            front_prompt=front,
            back_answer=back,
            formula_or_code=formula_or_code,
            difficulty=difficulty,
            is_bookmarked=is_bookmarked,
            learning_status=learning_status,
            review_count=0,
            next_review=now_iso,
            updated_at=now_iso
        )
        self.flashcards[card_id] = fc
        self._save_to_disk()
        return fc

    def save_flashcards_batch(self, cards: List[Dict[str, Any]], user_id: str = "guest_student") -> List[FlashcardItem]:
        saved = []
        for card_data in cards:
            c = self.add_flashcard(
                subject=card_data.get("subject", "General"),
                topic=card_data.get("topic", "General"),
                front=card_data.get("front_prompt", ""),
                back=card_data.get("back_answer", ""),
                formula_or_code=card_data.get("formula_or_code"),
                difficulty=card_data.get("difficulty", "medium"),
                is_bookmarked=card_data.get("is_bookmarked", False),
                learning_status=card_data.get("learning_status", "learning"),
                note_id=card_data.get("note_id"),
                user_id=user_id,
                card_id=card_data.get("id")
            )
            saved.append(c)
        return saved

    def update_flashcard(self, card_id: str, updates: Dict[str, Any], user_id: Optional[str] = None) -> Optional[FlashcardItem]:
        if card_id not in self.flashcards:
            return None
        existing = self.flashcards[card_id]
        if user_id and existing.user_id not in (user_id, "guest_student"):
            return None
        data = existing.model_dump()
        for k, v in updates.items():
            if v is not None and k not in ("id", "user_id"):
                data[k] = v
        data["updated_at"] = datetime.now(timezone.utc).isoformat()
        updated = FlashcardItem(**data)
        self.flashcards[card_id] = updated
        self._save_to_disk()
        return updated

    def review_flashcard(self, card_id: str, rating: str, learning_status: Optional[str] = None) -> Optional[FlashcardItem]:
        if card_id in self.flashcards:
            fc = self.flashcards[card_id]
            fc.review_count += 1
            fc.difficulty = rating
            if learning_status:
                fc.learning_status = learning_status
            elif rating == "easy":
                fc.learning_status = "known"
            elif rating == "medium":
                fc.learning_status = "learning"
            elif rating == "hard":
                fc.learning_status = "unknown"
            fc.next_review = datetime.now(timezone.utc).isoformat()
            fc.updated_at = datetime.now(timezone.utc).isoformat()
            self._save_to_disk()
            return fc
        return None

    def delete_flashcard(self, card_id: str, user_id: Optional[str] = None) -> bool:
        if card_id in self.flashcards:
            existing = self.flashcards[card_id]
            if user_id and existing.user_id not in (user_id, "guest_student"):
                return False
            del self.flashcards[card_id]
            self._save_to_disk()
            return True
        return False

    # Scan operations
    def save_scan(self, scan_data: Dict[str, Any], user_id: str = "guest_student") -> Dict[str, Any]:
        scan_id = scan_data.get("id") or scan_data.get("scan_id") or f"scan-{uuid.uuid4().hex[:8]}"
        doc = {
            "id": scan_id,
            "user_id": user_id,
            "text": scan_data.get("text", ""),
            "subject": scan_data.get("subject", "General Engineering"),
            "topic": scan_data.get("topic", "Core Concepts"),
            "confidence": scan_data.get("confidence", "High"),
            "uncertain_segments": scan_data.get("uncertain_segments", []),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        # Update if exists or append
        self.scans = [s for s in self.scans if s.get("id") != scan_id]
        self.scans.insert(0, doc)
        self._save_to_disk()
        return doc

    def get_scan_history(self, user_id: str = "guest_student", limit: int = 20) -> List[Dict[str, Any]]:
        user_scans = [s for s in self.scans if s.get("user_id") in (user_id, "guest_student")]
        return user_scans[:limit]

    # Chat operations
    def save_chat_message(
        self,
        session_id: str,
        user_id: str,
        user_message: Dict[str, Any],
        ai_reply: Dict[str, Any],
        subject: Optional[str] = None,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        user_text = user_message.get("content", "")
        title = topic or (user_text[:35] + ("..." if len(user_text) > 35 else ""))
        if session_id in self.chat_sessions:
            sess = self.chat_sessions[session_id]
            sess["messages"].extend([user_message, ai_reply])
            sess["updated_at"] = now_iso
            if subject:
                sess["subject"] = subject
            if topic:
                sess["topic"] = topic
        else:
            self.chat_sessions[session_id] = {
                "session_id": session_id,
                "user_id": user_id,
                "title": title or "Chat Session",
                "subject": subject or "General Engineering",
                "topic": topic or "Core Concepts",
                "messages": [user_message, ai_reply],
                "created_at": now_iso,
                "updated_at": now_iso
            }
        self._save_to_disk()
        return {"session_id": session_id, "updated_at": now_iso}

    def get_chat_sessions(self, user_id: str = "guest_student", limit: int = 20) -> List[Dict[str, Any]]:
        sessions = [s for s in self.chat_sessions.values() if s.get("user_id") in (user_id, "guest_student")]
        sessions.sort(key=lambda s: s.get("updated_at", ""), reverse=True)
        return sessions[:limit]

    def get_chat_session(self, session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        sess = self.chat_sessions.get(session_id)
        if not sess:
            return None
        if user_id and sess.get("user_id") not in (user_id, "guest_student"):
            return None
        return sess

    # Active Quiz Progress operations
    def save_quiz_progress(
        self,
        quiz_id: str,
        answers: Dict[str, int],
        current_question_index: int,
        time_taken_seconds: int,
        is_completed: bool,
        user_id: str = "guest_student",
        quiz_meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        key = f"{user_id}:{quiz_id}"
        doc = {
            "quiz_id": quiz_id,
            "user_id": user_id,
            "answers": answers,
            "current_question_index": current_question_index,
            "time_taken_seconds": time_taken_seconds,
            "is_completed": is_completed,
            "updated_at": now_iso
        }
        if quiz_meta:
            for k in ["title", "subject", "topic", "difficulty", "total_questions", "questions"]:
                if k in quiz_meta and quiz_meta[k] is not None:
                    doc[k] = quiz_meta[k]
        self.quiz_progress[key] = doc
        self._save_to_disk()
        return doc

    def get_active_quiz(self, user_id: str = "guest_student") -> Optional[Dict[str, Any]]:
        active = [
            v for v in self.quiz_progress.values()
            if v.get("user_id") == user_id and not v.get("is_completed", False)
        ]
        if not active:
            return None
        active.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
        return active[0]

    def complete_quiz_progress(self, quiz_id: str, user_id: str = "guest_student"):
        key = f"{user_id}:{quiz_id}"
        if key in self.quiz_progress:
            self.quiz_progress[key]["is_completed"] = True
            self.quiz_progress[key]["updated_at"] = datetime.now(timezone.utc).isoformat()
            self._save_to_disk()

    # User Preferences operations
    def save_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        clean_pref = {
            "user_id": user_id,
            "preferred_language": preferences.get("preferred_language", "en"),
            "default_difficulty": preferences.get("default_difficulty", "medium"),
            "default_quiz_questions": preferences.get("default_quiz_questions", 5),
            "study_mode": preferences.get("study_mode", "standard"),
            "theme": preferences.get("theme", "dark"),
            "auto_save_enabled": preferences.get("auto_save_enabled", True),
            "updated_at": now_iso
        }
        self.user_preferences[user_id] = clean_pref
        self._save_to_disk()
        return clean_pref

    def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        if user_id in self.user_preferences:
            return self.user_preferences[user_id]
        return {
            "user_id": user_id,
            "preferred_language": "en",
            "default_difficulty": "medium",
            "default_quiz_questions": 5,
            "study_mode": "standard",
            "theme": "dark",
            "auto_save_enabled": True
        }

    # Analytics
    def get_analytics(self, user_id: str = "guest_student") -> ProgressAnalytics:
        user_notes = [n for n in self.notes.values() if n.user_id in (user_id, "guest_student")]
        user_attempts = [a for a in self.attempts if a.get("user_id") in (user_id, "guest_student")]
        user_cards = [c for c in self.flashcards.values() if c.user_id in (user_id, "guest_student")]

        total_notes = len(user_notes)
        total_quizzes = len(user_attempts)
        avg_acc = (sum(a.get("score_percentage", 0.0) for a in user_attempts) / total_quizzes) if total_quizzes > 0 else 0.0
        total_fc_reviewed = sum(c.review_count for c in user_cards)

        subject_map: Dict[str, Dict[str, Any]] = {}
        weak_topics_set = set()
        for a in user_attempts:
            subj = a.get("subject", "General")
            if subj not in subject_map:
                subject_map[subj] = {"subject": subj, "total_score": 0.0, "count": 0}
            subject_map[subj]["total_score"] += a.get("score_percentage", 0.0)
            subject_map[subj]["count"] += 1
            for wt in a.get("weak_topics", []):
                weak_topics_set.add(wt)

        subject_performance = []
        for subj, data in subject_map.items():
            subject_performance.append({
                "subject": subj,
                "accuracy": round(data["total_score"] / data["count"], 1),
                "quizzes_taken": data["count"]
            })

        recent = list(reversed(user_attempts[-5:]))
        recommended = None
        if weak_topics_set:
            recommended = f"Review foundational concept: {list(weak_topics_set)[0]}"
        elif total_notes > 0:
            recommended = f"Practice quiz on {user_notes[0].topic}"

        return ProgressAnalytics(
            total_notes=total_notes,
            quizzes_completed=total_quizzes,
            average_accuracy=round(avg_acc, 1),
            study_streak_days=3 if total_quizzes > 0 else 0,
            flashcards_reviewed=total_fc_reviewed,
            subject_performance=subject_performance,
            weak_topics=list(weak_topics_set)[:6],
            recent_activity=recent,
            recommended_revision=recommended
        )

    # Auth & OTP operations
    def save_otp(self, email: str, otp: str, expires_minutes: int = 10) -> bool:
        self.otps[email.lower().strip()] = otp
        self._save_to_disk()
        return True

    def verify_otp(self, email: str, otp: str) -> bool:
        clean_email = email.lower().strip()
        expected = self.otps.get(clean_email)
        if expected and expected == otp.strip():
            self.otps.pop(clean_email, None)
            self._save_to_disk()
            return True
        return False

    def save_reset_token(self, email: str, token: str, otp: str, expires_minutes: int = 15) -> bool:
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
        self.reset_tokens[email.lower().strip()] = {
            "token": token,
            "otp": otp,
            "expires_at": expires_at.isoformat(),
            "used": False
        }
        self._save_to_disk()
        return True

    def verify_reset_otp(self, email: str, otp: str) -> bool:
        clean_email = email.lower().strip()
        rec = self.reset_tokens.get(clean_email)
        if rec and not rec.get("used") and rec.get("otp") == otp.strip():
            exp_str = rec.get("expires_at")
            if exp_str:
                try:
                    if datetime.now(timezone.utc) > datetime.fromisoformat(exp_str):
                        return False
                except Exception:
                    pass
            rec["used"] = True
            self._save_to_disk()
            return True
        return False

    def set_user_password(self, email: str, password_hash: str) -> bool:
        clean_email = email.lower().strip()
        user = self.get_or_create_user(clean_email)
        user["password_hash"] = password_hash
        self.users[clean_email] = user
        self._save_to_disk()
        return True

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        return self.users.get(email.lower().strip())

    def get_or_create_user(self, email: str, name: Optional[str] = None) -> Dict[str, Any]:
        clean_email = email.lower().strip()
        if clean_email in self.users:
            return self.users[clean_email]
        user = {
            "id": f"usr-{uuid.uuid4().hex[:8]}",
            "email": clean_email,
            "name": name or clean_email.split("@")[0].capitalize(),
            "college_branch": "CSE (AI & ML)",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        self.users[clean_email] = user
        self._save_to_disk()
        return user


class HybridStorageStore:
    def __init__(self):
        self.in_memory = InMemoryStore()

    # Note operations
    def get_notes(self, user_id: str = "guest_student") -> List[NoteItem]:
        if mongodb_service.is_connected:
            return mongodb_service.get_notes(user_id)
        return self.in_memory.get_notes(user_id)

    def get_note(self, note_id: str) -> Optional[NoteItem]:
        if mongodb_service.is_connected:
            return mongodb_service.get_note(note_id)
        return self.in_memory.get_note(note_id)

    def save_note(
        self,
        title: str,
        subject: str,
        topic: str,
        raw_text: str,
        summary: Optional[str] = None,
        telugu_summary: Optional[str] = None,
        user_id: str = "guest_student",
        note_id: Optional[str] = None
    ) -> NoteItem:
        saved_local = self.in_memory.save_note(title, subject, topic, raw_text, summary, telugu_summary, user_id, note_id)
        if mongodb_service.is_connected:
            return mongodb_service.save_note(title, subject, topic, raw_text, summary, telugu_summary, user_id, saved_local.id)
        return saved_local

    def update_note(self, note_id: str, updates: Dict[str, Any], user_id: Optional[str] = None) -> Optional[NoteItem]:
        res_mem = self.in_memory.update_note(note_id, updates, user_id)
        if mongodb_service.is_connected:
            res_mongo = mongodb_service.update_note(note_id, updates, user_id)
            if res_mongo:
                return res_mongo
        return res_mem

    def delete_note(self, note_id: str) -> bool:
        if mongodb_service.is_connected:
            mongodb_service.delete_note(note_id)
        return self.in_memory.delete_note(note_id)

    # Quiz operations
    def store_quiz(self, quiz_id: str, title: str, subject: str, topic: str, difficulty: str, questions: List[QuestionItem]):
        self.in_memory.store_quiz(quiz_id, title, subject, topic, difficulty, questions)
        if mongodb_service.is_connected:
            mongodb_service.store_quiz(quiz_id, title, subject, topic, difficulty, questions)

    def get_quiz(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        if mongodb_service.is_connected:
            q = mongodb_service.get_quiz(quiz_id)
            if q:
                return q
        return self.in_memory.get_quiz(quiz_id)

    def record_attempt(self, attempt_data: Dict[str, Any]):
        self.in_memory.record_attempt(attempt_data)
        if mongodb_service.is_connected:
            mongodb_service.record_attempt(attempt_data)

    def get_attempts(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        if mongodb_service.is_connected:
            return mongodb_service.get_attempts(user_id)
        return self.in_memory.get_attempts(user_id)

    def record_question_history(
        self,
        user_id: str,
        quiz_id: str,
        topic: str,
        subject: str,
        difficulty: str,
        questions: List[Any],
        score_percentage: float
    ):
        self.in_memory.record_question_history(user_id, quiz_id, topic, subject, difficulty, questions, score_percentage)
        if mongodb_service.is_connected:
            mongodb_service.record_question_history(user_id, quiz_id, topic, subject, difficulty, questions, score_percentage)

    def get_user_attempted_fingerprints(self, user_id: str, topic: Optional[str] = None) -> set:
        if mongodb_service.is_connected:
            return mongodb_service.get_user_attempted_fingerprints(user_id, topic)
        return self.in_memory.get_user_attempted_fingerprints(user_id, topic)

    def get_user_attempted_question_stems(self, user_id: str, topic: Optional[str] = None, limit: int = 50) -> List[str]:
        if mongodb_service.is_connected:
            return mongodb_service.get_user_attempted_question_stems(user_id, topic, limit)
        return self.in_memory.get_user_attempted_question_stems(user_id, topic, limit)

    # Flashcard operations
    def get_flashcards(self, subject: Optional[str] = None, user_id: str = "guest_student") -> List[FlashcardItem]:
        if mongodb_service.is_connected:
            return mongodb_service.get_flashcards(subject, user_id)
        return self.in_memory.get_flashcards(subject, user_id)

    def add_flashcard(
        self,
        subject: str,
        topic: str,
        front: str,
        back: str,
        formula_or_code: Optional[str] = None,
        difficulty: str = "medium",
        is_bookmarked: bool = False,
        learning_status: str = "learning",
        note_id: Optional[str] = None,
        user_id: str = "guest_student",
        card_id: Optional[str] = None
    ) -> FlashcardItem:
        card = self.in_memory.add_flashcard(
            subject=subject,
            topic=topic,
            front=front,
            back=back,
            formula_or_code=formula_or_code,
            difficulty=difficulty,
            is_bookmarked=is_bookmarked,
            learning_status=learning_status,
            note_id=note_id,
            user_id=user_id,
            card_id=card_id
        )
        if mongodb_service.is_connected:
            return mongodb_service.add_flashcard(
                subject=subject,
                topic=topic,
                front=front,
                back=back,
                formula_or_code=formula_or_code,
                difficulty=difficulty,
                is_bookmarked=is_bookmarked,
                learning_status=learning_status,
                note_id=note_id,
                user_id=user_id,
                card_id=card.id
            )
        return card

    def save_flashcards_batch(self, cards: List[Dict[str, Any]], user_id: str = "guest_student") -> List[FlashcardItem]:
        local_saved = self.in_memory.save_flashcards_batch(cards, user_id)
        if mongodb_service.is_connected:
            return mongodb_service.save_flashcards_batch(cards, user_id)
        return local_saved

    def update_flashcard(self, card_id: str, updates: Dict[str, Any], user_id: Optional[str] = None) -> Optional[FlashcardItem]:
        res_mem = self.in_memory.update_flashcard(card_id, updates, user_id)
        if mongodb_service.is_connected:
            res_mongo = mongodb_service.update_flashcard(card_id, updates, user_id)
            if res_mongo:
                return res_mongo
        return res_mem

    def review_flashcard(self, card_id: str, rating: str, learning_status: Optional[str] = None) -> Optional[FlashcardItem]:
        res_mem = self.in_memory.review_flashcard(card_id, rating, learning_status)
        if mongodb_service.is_connected:
            res_mongo = mongodb_service.review_flashcard(card_id, rating, learning_status)
            if res_mongo:
                return res_mongo
        return res_mem

    def delete_flashcard(self, card_id: str, user_id: Optional[str] = None) -> bool:
        deleted_local = self.in_memory.delete_flashcard(card_id, user_id)
        if mongodb_service.is_connected:
            deleted_mongo = mongodb_service.delete_flashcard(card_id, user_id)
            return deleted_mongo or deleted_local
        return deleted_local

    # Scans operations
    def save_scan(self, scan_data: Dict[str, Any], user_id: str = "guest_student") -> Dict[str, Any]:
        doc = self.in_memory.save_scan(scan_data, user_id)
        if mongodb_service.is_connected:
            return mongodb_service.save_scan(scan_data, user_id)
        return doc

    def get_scan_history(self, user_id: str = "guest_student", limit: int = 20) -> List[Dict[str, Any]]:
        if mongodb_service.is_connected:
            return mongodb_service.get_scan_history(user_id, limit)
        return self.in_memory.get_scan_history(user_id, limit)

    # Chat operations
    def save_chat_message(
        self,
        session_id: str,
        user_id: str,
        user_message: Dict[str, Any],
        ai_reply: Dict[str, Any],
        subject: Optional[str] = None,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        self.in_memory.save_chat_message(session_id, user_id, user_message, ai_reply, subject, topic)
        if mongodb_service.is_connected:
            return mongodb_service.save_chat_message(session_id, user_id, user_message, ai_reply, subject, topic)
        return {"session_id": session_id}

    def get_chat_sessions(self, user_id: str = "guest_student", limit: int = 20) -> List[Dict[str, Any]]:
        if mongodb_service.is_connected:
            return mongodb_service.get_chat_sessions(user_id, limit)
        return self.in_memory.get_chat_sessions(user_id, limit)

    def get_chat_session(self, session_id: str, user_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        if mongodb_service.is_connected:
            res = mongodb_service.get_chat_session(session_id, user_id)
            if res:
                return res
        return self.in_memory.get_chat_session(session_id, user_id)

    # Active Quiz Progress operations
    def save_quiz_progress(
        self,
        quiz_id: str,
        answers: Dict[str, int],
        current_question_index: int,
        time_taken_seconds: int,
        is_completed: bool,
        user_id: str = "guest_student",
        quiz_meta: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        doc = self.in_memory.save_quiz_progress(
            quiz_id, answers, current_question_index, time_taken_seconds, is_completed, user_id, quiz_meta
        )
        if mongodb_service.is_connected:
            return mongodb_service.save_quiz_progress(
                quiz_id, answers, current_question_index, time_taken_seconds, is_completed, user_id, quiz_meta
            )
        return doc

    def get_active_quiz(self, user_id: str = "guest_student") -> Optional[Dict[str, Any]]:
        if mongodb_service.is_connected:
            active = mongodb_service.get_active_quiz(user_id)
            if active:
                return active
        return self.in_memory.get_active_quiz(user_id)

    def complete_quiz_progress(self, quiz_id: str, user_id: str = "guest_student"):
        self.in_memory.complete_quiz_progress(quiz_id, user_id)
        if mongodb_service.is_connected:
            mongodb_service.complete_quiz_progress(quiz_id, user_id)

    # User Preferences operations
    def save_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> Dict[str, Any]:
        pref = self.in_memory.save_user_preferences(user_id, preferences)
        if mongodb_service.is_connected:
            return mongodb_service.save_user_preferences(user_id, preferences)
        return pref

    def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        if mongodb_service.is_connected:
            return mongodb_service.get_user_preferences(user_id)
        return self.in_memory.get_user_preferences(user_id)

    # Analytics
    def get_analytics(self, user_id: str = "guest_student") -> ProgressAnalytics:
        if mongodb_service.is_connected:
            return mongodb_service.get_analytics(user_id)
        return self.in_memory.get_analytics(user_id)

    # Auth & OTP operations
    def save_otp(self, email: str, otp: str, expires_minutes: int = 10) -> bool:
        email_clean = email.lower().strip()
        self.in_memory.save_otp(email_clean, otp, expires_minutes)
        if mongodb_service.is_connected:
            mongodb_service.save_otp(email_clean, otp, expires_minutes)
        return True

    def verify_otp(self, email: str, otp: str) -> bool:
        email_clean = email.lower().strip()
        code_clean = otp.strip()
        if mongodb_service.is_connected:
            if mongodb_service.verify_otp(email_clean, code_clean):
                return True
        return self.in_memory.verify_otp(email_clean, code_clean)

    def save_reset_token(self, email: str, token: str, otp: str, expires_minutes: int = 15) -> bool:
        email_clean = email.lower().strip()
        self.in_memory.save_reset_token(email_clean, token, otp, expires_minutes)
        if mongodb_service.is_connected:
            mongodb_service.save_reset_token(email_clean, token, otp, expires_minutes)
        return True

    def verify_reset_otp(self, email: str, otp: str) -> bool:
        email_clean = email.lower().strip()
        code_clean = otp.strip()
        if mongodb_service.is_connected:
            if mongodb_service.verify_reset_otp(email_clean, code_clean):
                return True
        return self.in_memory.verify_reset_otp(email_clean, code_clean)

    def set_user_password(self, email: str, password_hash: str) -> bool:
        email_clean = email.lower().strip()
        self.in_memory.set_user_password(email_clean, password_hash)
        if mongodb_service.is_connected:
            mongodb_service.set_user_password(email_clean, password_hash)
        return True

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.lower().strip()
        if mongodb_service.is_connected:
            u = mongodb_service.get_user_by_email(email_clean)
            if u:
                return u
        return self.in_memory.get_user_by_email(email_clean)

    def get_or_create_user(self, email: str, name: Optional[str] = None) -> Dict[str, Any]:
        email_clean = email.lower().strip()
        if mongodb_service.is_connected:
            user = mongodb_service.get_or_create_user(email_clean, name)
            if user:
                return user
        return self.in_memory.get_or_create_user(email_clean, name)


store = HybridStorageStore()
