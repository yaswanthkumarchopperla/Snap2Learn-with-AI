# Snap2Learn AI 📚✨

![Snap2Learn AI Logo](frontend/public/favicon.svg)

> **Tagline:** Snap. Understand. Practice. Master.  
> **Project Type:** Full-Stack AI-Powered Education Web Application  
> **Target Audience:** First-Year CSE & AIML Engineering Undergraduates (College Hackathon Edition)

---

## 1. Project Name & Tagline
- **Project Name:** Snap2Learn AI
- **Tagline:** Snap. Understand. Practice. Master.
- **Logo:** Open book stylized with camera scan frame brackets and an AI sparkle beacon.

---

## 2. Project Overview
Snap2Learn AI is a production-grade, full-stack educational web application designed to bridge the gap between messy classroom lectures and exam mastery. Using **Google Gemini 2.5 Flash Multimodal Vision**, students capture handwritten notes, textbook pages, or complex equations. The platform instantly extracts clean mathematical notation, creates step-by-step explanations in **English, Telugu (తెలుగు), or Bilingual format**, powers an interactive conversational tutor, generates multiple-choice quizzes with deterministic scoring, and provides 3D spaced-repetition flashcards.

---

## 3. Problem Statement
First-year engineering students in Computer Science and AIML face major academic hurdles:
1. **Deciphering Notes:** Handwritten lecture notes and chalkboard diagrams are often rushed, incomplete, and difficult to read.
2. **Language Barrier:** Many students from regional language or state-board mediums struggle to grasp dense English technical vocabulary.
3. **Passive Reading vs. Active Recall:** Students spend hours reading textbooks without testing their retention or understanding common exam pitfalls.
4. **Lack of Immediate Clarification:** Professors and teaching assistants are not available 24/7 for step-by-step homework breakdowns.

---

## 4. Proposed Solution
Snap2Learn AI provides an end-to-end learning lifecycle:
- **Snap:** Capture study notes via webcam or drag-and-drop file upload.
- **Understand:** Multimodal AI extracts formulas and structures explanations across three modes (Beginner, Standard, Exam) in English and Telugu.
- **Practice:** AI-grounded quizzes with server-side deterministic grading and mistake rationale.
- **Master:** Interactive 3D flashcards and progress analytics highlighting weak concepts.

---

## 5. Key Features
- 📷 **Smart Note Scanner:** In-browser webcam capture via `navigator.mediaDevices.getUserMedia` with front/rear flip, drag-and-drop file upload (JPEG, PNG, WebP), and auto-stopping camera tracks.
- 📐 **Formula-Aware OCR:** Multimodal Gemini Vision extracts mathematical equations preserving LaTeX formatting ($...$ and $$...$$).
- ✏️ **Editable Confirmation Panel:** Students verify transcribed text, subject tags, and flagged ambiguous handwriting before generating learning content.
- 🌐 **Bilingual Regional Support:** Switch dynamically between English, authentic Telugu (తెలుగు), or side-by-side Bilingual modes.
- 🎓 **Multi-Tier Explanations:**
  - *Beginner Mode:* Everyday real-world analogies.
  - *Standard Mode:* Rigorous academic textbook definitions and proofs.
  - *Exam Preparation Mode:* Structured 5-mark and 10-mark model university exam answers.
- 🤖 **Contextual AI Tutor:** Real-time chat grounded in the student's active notes with suggested follow-up prompts and code blocks.
- 🏆 **AI Quiz Arena:** 5, 10, or 15 question MCQs with timed modes, client-side answer protection, deterministic server-side grading, and celebration confetti.
- 🃏 **Smart Flashcards:** 3D flip card animations with Spaced Repetition ease ratings (Easy, Medium, Hard).
- 📊 **Progress Analytics:** Interactive Recharts graphs tracking accuracy trends, subject mastery distribution, and weak academic concepts.
- 📁 **My Notes Repository:** Search, filter, inspect, and revisit past scanned materials and quizzes.
- 🛡️ **Autonomous Demo Mode:** Seamless offline fallback mode pre-loaded with college engineering content.

---

## 6. Architecture Diagram

```mermaid
graph TD
    User["Student Browser<br/>(Desktop, Tablet, Mobile)"]
    Frontend["React 19 + TypeScript + Vite<br/>Tailwind CSS | KaTeX | Recharts"]
    FastAPI["FastAPI Backend (Python 3.12)<br/>Uvicorn | Pydantic v2"]
    Gemini["Google Gemini 2.5 Flash<br/>official google-genai SDK"]
    Supabase["Supabase PostgreSQL<br/>Row Level Security (RLS) + Auth"]
    Storage["In-Memory Store<br/>Deterministic Evaluation Engine"]

    User -->|Webcam / Upload / Chat / Quizzes| Frontend
    Frontend -->|REST API Requests (/api/*)| FastAPI
    FastAPI -->|Multimodal Image & Prompts| Gemini
    Gemini -->|Structured OCR, Explanations, Quizzes| FastAPI
    FastAPI -->|Persistent Storage with RLS| Supabase
    FastAPI -->|Demo Mode & Local Cache| Storage
    FastAPI -->|Clean JSON Response| Frontend
    Frontend -->|KaTeX Math & Charts| User
```

---

## 7. Complete Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons, Glassmorphism CSS |
| **Math & Animations** | KaTeX (LaTeX math rendering), Canvas Confetti |
| **Charts & Data Viz** | Recharts (Responsive bar and area charts) |
| **Routing & Client State** | React Router v7, React Context API |
| **Backend Framework** | Python 3.12, FastAPI, Uvicorn, Pydantic v2 |
| **AI & Multimodal SDK** | Google Gen AI SDK (`google-genai` v2.34+), Gemini 2.5 Flash |
| **Image Processing** | Pillow (PIL) for image integrity and size validation |
| **Database & Auth** | Supabase PostgreSQL, Row Level Security (RLS) policies |
| **Testing** | Pytest, FastAPI TestClient, PIL In-Memory Fixtures |

---

## 8. Project Folder Structure

```
Study_sync/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.tsx     # Webcam getUserMedia with flip & cleanup
│   │   │   ├── MathRenderer.tsx      # KaTeX inline and block LaTeX renderer
│   │   │   ├── Navbar.tsx            # Header with brand and theme switch
│   │   │   ├── Sidebar.tsx           # Dashboard sidebar navigation
│   │   │   └── Footer.tsx            # Marketing footer
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx      # Dark (#080B18) and Light theme provider
│   │   │   └── AuthContext.tsx       # Auth provider & guest demo state
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx       # Marketing page with hero & previews
│   │   │   ├── AuthPage.tsx          # Sign In, Sign Up & Guest mode
│   │   │   ├── DashboardPage.tsx     # Student workspace & KPI charts
│   │   │   ├── ScannerPage.tsx       # Smart scanner & editable OCR panel
│   │   │   ├── ExplainPage.tsx       # Multi-mode & bilingual explanation engine
│   │   │   ├── ChatPage.tsx          # Conversational AI Tutor
│   │   │   ├── QuizPage.tsx          # Quiz Arena with deterministic scoring
│   │   │   ├── FlashcardsPage.tsx    # 3D flip cards with spaced repetition
│   │   │   ├── AnalyticsPage.tsx     # Performance analytics & weak concepts
│   │   │   ├── NotesPage.tsx         # Saved notes search & filter
│   │   │   └── SettingsPage.tsx      # Preferences, Telugu toggle & data purge
│   │   ├── services/
│   │   │   └── api.ts                # REST API client
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript interfaces
│   │   ├── App.tsx                   # Route provider
│   │   ├── main.tsx                  # Vite application root
│   │   └── index.css                 # Design system tokens & glassmorphism
│   ├── public/
│   │   └── favicon.svg               # Stylized SVG brand icon
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health.py             # GET /api/health
│   │   │   ├── scan.py               # POST /api/scan (image validation)
│   │   │   ├── explain.py            # POST /api/explain
│   │   │   ├── chat.py               # POST /api/chat
│   │   │   ├── quiz.py               # POST /api/quiz/generate & /submit
│   │   │   ├── notes.py              # CRUD /api/notes
│   │   │   ├── flashcards.py         # /api/flashcards
│   │   │   └── progress.py           # GET /api/progress
│   │   ├── core/
│   │   │   └── config.py             # Environment & CORS configuration
│   │   ├── schemas/
│   │   │   ├── scan.py               # OCR validation schemas
│   │   │   ├── explain.py            # Multi-mode explanation schemas
│   │   │   ├── chat.py               # Chat schemas
│   │   │   ├── quiz.py               # Quiz & scoring schemas
│   │   │   └── note.py               # Notes, flashcards & analytics schemas
│   │   ├── services/
│   │   │   ├── gemini_service.py     # Official Google Gen AI SDK integration
│   │   │   └── storage_service.py    # In-memory demo store & attempt tracker
│   │   └── main.py                   # FastAPI app entry point
│   ├── tests/
│   │   └── test_api.py               # 8 pytest unit and integration tests
│   ├── requirements.txt              # Python dependencies
│   └── .env.example
├── supabase/
│   └── migrations/
│       └── 20261030_init_schema.sql  # 10 PostgreSQL tables with RLS policies
├── docs/
│   ├── architecture.md               # System architecture & Mermaid flow
│   ├── api.md                        # Full REST API specification
│   └── demo-script.md                # Hackathon live presentation walkthrough
├── README.md
├── QUICKSTART.md
└── .gitignore
```

---

## 9. Prerequisites
- **Node.js:** v18.0.0 or higher (`node -v`)
- **npm:** v9.0.0 or higher (`npm -v`)
- **Python:** 3.11 or 3.12 (`python --version`)
- **Git**

---

## 10. Local Setup Instructions

Clone the repository and enter the project folder:
```bash
git clone <repository_url>
cd Study_sync
```

---

## 11. Frontend Installation Commands

```bash
cd frontend
npm install
```

---

## 12. Python Virtual Environment and Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\activate
# On macOS / Linux:
# source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

---

## 13. Environment Variable Configuration

Create `.env` in `backend/`:
```bash
# In backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
MAX_UPLOAD_SIZE_MB=10
```

*(Note: If `GEMINI_API_KEY` is not provided, the application runs automatically in Guest Demo Mode with realistic engineering samples.)*

---

## 14. How to Obtain and Configure a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click **"Get API key"** and create a new key.
4. Copy the API key and paste it into `backend/.env` as `GEMINI_API_KEY=AIzaSy...`.
5. The backend will automatically use `gemini-2.5-flash` for multimodal vision, OCR, and reasoning.

---

## 15. Supabase Setup, Schema Migration, and RLS Configuration
1. Create a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Copy the contents of [`supabase/migrations/20261030_init_schema.sql`](supabase/migrations/20261030_init_schema.sql).
4. Run the query to create all 10 tables:
   `profiles`, `notes`, `learning_sessions`, `chat_messages`, `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_answers`, `flashcards`, `flashcard_reviews`.
5. Row Level Security (RLS) is automatically enabled on every table so students can only access their own records.

---

## 16. How to Run Frontend and Backend

**Terminal 1 — Backend:**
```bash
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 17. Complete 5-Step Learning Workflow

Snap2Learn AI features a seamless, end-to-end 5-step guided learning stepper:

### Step 1: Upload or Capture
- **Open Camera:** Click **"Open Camera"** to trigger in-browser webcam capture via `navigator.mediaDevices.getUserMedia({video: true})`. Requests permission only on click, displays live preview with viewfinder brackets, provides **"Capture Photo"**, **"Retake"**, and **"Close"** buttons, and reliably stops all media tracks when closed.
- **File Upload:** Drag & drop any `.jpg`, `.png`, or `.webp` image (up to 10MB) or click **"Upload Photo"**.
- **Instant Engineering Sample:** Click **"Load Engineering Sample"** to instantly test the full workflow without an image.
- **Image Preview & Controls:** After selecting an image, a large preview is displayed alongside clear **"Extract Notes"**, **"Replace Photo"**, and **"Remove"** buttons.

### Step 2: Extract Text (OCR Review & Edit)
- Transcribed mathematical notation and textbook text are displayed in an editable monospace text area.
- Students can correct OCR mistakes and edit the identified subject and topic tags.
- LaTeX equations (`$...$` and `$$...$$`) render live in a formula preview card.
- Sample/demo fallback results are clearly labeled (`⚡ Demo Mode (Sample Notes)`) and never fabricated as if read from an uploaded image.
- Click **"Generate Simple Notes →"** to proceed.

### Step 3: Generate Simple Notes (AI Explanation Engine)
- Choose explanation mode: **Beginner** (real-world analogies), **Standard** (academic textbook), or **Exam Prep** (university 5/10 mark answers).
- Choose language: **English**, **Bilingual (English + Telugu)**, or **తెలుగు (Telugu)**.
- Review short summary, step-by-step breakdown, key definitions, LaTeX formulas, real-world engineering applications, common exam mistakes to avoid, and revision notes.
- Click **"Copy Notes"** to copy the formatted notes to clipboard.
- Click **"Save Note"** to persist into your study workspace.
- Click **"Generate Practice Quiz →"** to advance.

### Step 4: Practice Quiz Arena
- Select 5 or 10 multiple-choice questions and difficulty level (Easy, Medium, Hard).
- Questions are dynamically generated and grounded directly in your notes.
- Each question presents 4 distinct choices with interactive radio cards and progress indicators.
- Navigate questions with **"Previous"** and **"Next Question"**.
- Click **"Submit Quiz"** to evaluate answers server-side.

### Step 5: View Score & Concept Rationale
- Immediate deterministic score calculation showing percentage and accuracy ratio.
- Confetti celebration upon passing!
- Question-by-question breakdown showing selected answers vs correct answers with detailed concept explanations.
- Action buttons to **"Retake Quiz"**, **"Review Notes"**, or **"Start New Scan"**.

---

## 18. API Endpoint Documentation
Detailed documentation is in [`docs/api.md`](docs/api.md). Key routes include:
- `GET /api/health` — Status and demo mode verification
- `POST /api/scan` — Multimodal vision OCR with Pillow validation
- `POST /api/explain` — Structured explanation in English/Telugu
- `POST /api/chat` — Contextual AI tutor conversation
- `POST /api/quiz/generate` — MCQ generation without leaking answer keys
- `POST /api/quiz/submit` — Server-side deterministic grading
- `GET /api/notes` — Saved notes CRUD
- `GET /api/flashcards` — Spaced repetition flashcards
- `GET /api/progress` — Computed student analytics

---

## 19. Demo Mode Instructions
- When `GEMINI_API_KEY` is not configured, the app runs in **Autonomous Demo Mode** (`is_demo: true`).
- Pre-seeded engineering modules on **Eigenvalues & Characteristic Equation**, **Convolutional Neural Networks**, and **Data Structures** are available instantly.
- Students can also click **"Load Engineering Sample"** on the scanner page to run an end-to-end demo without taking a photo.

---

## 20. Testing Instructions

Execute the automated backend test suite:
```bash
# From workspace root
.\backend\venv\Scripts\pytest backend\tests -v
```

**Test Results:**
- `test_health_endpoint`: Verified system health flags.
- `test_image_upload_invalid_type`: Verified rejection of non-image MIME types (400 Bad Request).
- `test_image_upload_valid_image`: Verified Pillow image validation and OCR pipeline.
- `test_explain_endpoint_validation`: Verified Pydantic validation on short text.
- `test_explain_endpoint_success`: Verified formula, definition, and model answer structure.
- `test_quiz_generate_and_deterministic_scoring`: Verified client answer key protection and exact mathematical scoring.
- `test_notes_crud`: Verified creation, listing, retrieval, and deletion of study notes.
- `test_flashcards_and_progress`: Verified spaced repetition ratings and analytics aggregation.

---

## 21. Vercel Frontend Deployment Steps
1. Push project to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and select your repository.
3. Set **Root Directory** to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed Render backend (e.g. `https://snap2learn-api.onrender.com/api`)
7. Click **Deploy**.

---

## 22. Render Backend Deployment Steps
1. In [Render](https://render.com), click **New Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Environment: `Python 3`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gen AI key
   - `GEMINI_MODEL`: `gemini-2.5-flash`
8. Click **Create Web Service**.

---

## 23. CORS and Environment Configuration
The backend CORS policy is preconfigured in `backend/app/core/config.py`:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- Add your deployed Vercel domain to `CORS_ORIGINS` in production.

---

## 24. Troubleshooting Common Errors
- **"Camera access denied":** Ensure your browser has permission to access your webcam. On desktop browsers, check the lock icon in the address bar. If using an insecure origin without SSL, the browser blocks `getUserMedia`; switch to image file upload.
- **"ModuleNotFoundError: No module named 'app'":** Ensure you activate the virtual environment (`.\backend\venv\Scripts\activate`) before running python commands.
- **"File exceeds maximum allowed size":** Upload photos under 10MB or reduce camera resolution.

---

## 25. Security and Privacy Notes
- API keys are never exposed in frontend code; all Gemini SDK calls originate strictly from FastAPI.
- Camera streams are accessed solely after explicit user action (`onClick`) and all tracks are terminated immediately when closing the modal or changing routes.
- Images are processed in memory and validated with Pillow to prevent arbitrary file upload vulnerabilities.
- Database access is protected by Supabase Row Level Security (RLS) policies.

---

## 26. Known Limitations
- Severely faded or low-contrast handwritten ink may require user editing in the confirmation panel.
- Camera switching requires device hardware support (front and rear cameras).
- Supabase synchronization requires free Supabase project credentials.

---

## 27. Future Improvements
- Audio transcription for live classroom lectures.
- Native mobile app wrapper using Capacitor / React Native.
- Peer study rooms with collaborative flashcard battles.
- Hand-drawn circuit diagram to SPICE simulation netlist converter.

---

## 28. Hackathon Demo Walkthrough
Follow the 3-minute presentation script in [`docs/demo-script.md`](docs/demo-script.md):
1. **Landing Page:** Animated workflow preview.
2. **Scanner:** Webcam capture or "Load Engineering Sample".
3. **Explanation Engine:** Show LaTeX equations and switch to Telugu (తెలుగు) mode.
4. **AI Tutor:** Contextual follow-up question.
5. **Quiz Arena:** 5 questions, deterministic scoring, mistake review, and confetti celebration.
6. **Analytics:** Live Recharts accuracy graphs.

---

## 29. Team Members
- **Yashwanth Ch** — Lead Full-Stack & AI Engineer
- *Team Member 2 (Placeholder)* — Frontend & UX Designer
- *Team Member 3 (Placeholder)* — Backend & Database Engineer

---

## 30. License
This project is developed for college hackathons and academic learning. All rights reserved by the project authors.
