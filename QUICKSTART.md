# Snap2Learn AI — Quickstart Guide

Run the full application locally in under 2 minutes.

---

## 1. Prerequisites
- **Node.js**: v18+ installed
- **Python**: 3.11+ installed

---

## 2. Start Backend (Terminal 1)

```bash
# Navigate to backend directory
cd backend

# If virtual environment is not already created:
# python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install requirements (if first time)
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend is now live at: `http://localhost:8000`  
API Swagger Documentation: `http://localhost:8000/docs`

---

## 3. Start Frontend (Terminal 2)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if first time)
npm install

# Start Vite development server
npm run dev
```

The frontend is now live at: `http://localhost:5173`

---

## 4. Run Backend Tests

```bash
# From workspace root
.\backend\venv\Scripts\pytest backend\tests -v
```

---

## 5. (Optional) Configure Gemini API Key
To use live Multimodal Gemini AI instead of the autonomous demo mode:
1. Copy `backend/.env.example` to `backend/.env`.
2. Add your key from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash
   ```
3. Restart the backend server.
