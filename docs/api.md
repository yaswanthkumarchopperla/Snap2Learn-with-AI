# Snap2Learn AI — API Documentation

**Base URL:** `http://localhost:8000/api`

---

## 1. Health & Status

### `GET /api/health`
Returns system status, active features, and whether Gemini API key is configured or operating in Demo Mode.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "app_name": "Snap2Learn AI Backend",
  "version": "1.0.0",
  "gemini_configured": true,
  "gemini_model": "gemini-2.5-flash",
  "demo_mode_active": false,
  "features": {
    "camera_scanner": true,
    "multimodal_ocr": true,
    "bilingual_telugu": true,
    "quiz_arena": true,
    "deterministic_scoring": true,
    "flashcards": true,
    "progress_analytics": true
  }
}
```

---

## 2. Scanner & OCR

### `POST /api/scan`
Validates uploaded image and invokes Gemini Vision for mathematical OCR.

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP; max 10MB)
- `subject_hint`: (Optional) String hint e.g. "Linear Algebra"

**Response (200 OK):**
```json
{
  "text": "Extracted formatted text with $$A v = \\lambda v$$...",
  "subject": "Engineering Mathematics",
  "topic": "Eigenvalues & Characteristic Equation",
  "confidence": "High",
  "uncertain_segments": [],
  "is_demo": false
}
```

---

## 3. Explanation Engine

### `POST /api/explain`
Generates comprehensive explanations in English, Telugu, or Bilingual modes.

**Request Body (application/json):**
```json
{
  "text": "Let A be an n x n square matrix. A scalar lambda is called an eigenvalue...",
  "subject": "Engineering Mathematics",
  "topic": "Eigenvalues",
  "mode": "standard",
  "language": "bilingual"
}
```

**Response (200 OK):**
```json
{
  "subject": "Engineering Mathematics",
  "topic": "Eigenvalues",
  "mode": "standard",
  "language": "bilingual",
  "short_summary": "An eigenvalue is a scalar multiplier...",
  "detailed_steps": ["Step 1...", "Step 2..."],
  "key_definitions": [
    {
      "term": "Eigenvalue",
      "definition": "A scalar scalar multiplier...",
      "telugu_translation": "ఐగన్‌విలువ"
    }
  ],
  "formulas": [
    {
      "name": "Characteristic Equation",
      "latex": "\\det(A - \\lambda I) = 0",
      "explanation": "Guarantees a non-trivial null space."
    }
  ],
  "real_life_example": "Used in Google PageRank and PCA...",
  "common_mistakes": [
    {
      "mistake": "Assuming zero vector can be an eigenvector",
      "correction": "Eigenvectors must be strictly non-zero."
    }
  ],
  "exam_answer": "Model 5-mark answer...",
  "quick_revision_notes": ["Av = λv", "det(A - λI) = 0"],
  "telugu_summary": "ఐగన్‌విలువ λ అనేది ఒక సంఖ్య...",
  "is_demo": false
}
```

---

## 4. AI Tutor Chat

### `POST /api/chat`
Answers contextual follow-up questions grounded in current study material.

**Request Body:**
```json
{
  "message": "Can you explain in simple Telugu?",
  "study_context": "Eigenvalues and matrix scaling",
  "subject": "Engineering Mathematics",
  "history": [],
  "language": "telugu"
}
```

**Response (200 OK):**
```json
{
  "reply": "నమస్కారం! ఐగన్‌విలువలు అంటే...",
  "suggested_followups": [
    "Can you give me a 2x2 matrix calculation step-by-step?",
    "What is the Cayley-Hamilton Theorem?"
  ],
  "is_demo": false
}
```

---

## 5. Quiz Arena

### `POST /api/quiz/generate`
Generates MCQ questions without exposing the answer key to the client.

**Request Body:**
```json
{
  "study_text": "Study material text...",
  "subject": "Engineering Mathematics",
  "topic": "Eigenvalues",
  "num_questions": 5,
  "difficulty": "medium"
}
```

### `POST /api/quiz/submit`
Deterministically calculates score and returns answer key analysis.

**Request Body:**
```json
{
  "quiz_id": "quiz-abc12345",
  "answers": {
    "q1": 0,
    "q2": 1
  },
  "time_taken_seconds": 45
}
```

---

## 6. Notes & Flashcards

- `GET /api/notes`: List saved notes
- `GET /api/notes/{id}`: Get single note
- `POST /api/notes`: Save new note
- `DELETE /api/notes/{id}`: Delete note
- `GET /api/flashcards`: List flashcards
- `POST /api/flashcards/{id}/review`: Rate flashcard (`easy`, `medium`, `hard`)
- `GET /api/progress`: Retrieve aggregated performance telemetry
