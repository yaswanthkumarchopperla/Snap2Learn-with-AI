import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api import (
    health,
    auth,
    scan,
    explain,
    chat,
    quiz,
    notes,
    flashcards,
    progress,
    pdf
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("snap2learn")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Snap2Learn AI — Full-Stack AI-Powered Education Platform for CSE-AIML Students."
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api
app.include_router(health.router, prefix="/api")
app.include_router(health.router)  # Direct /health for Render cronjobs & keep-alive pingers
app.include_router(auth.router, prefix="/api")
app.include_router(scan.router, prefix="/api")
app.include_router(explain.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(flashcards.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(pdf.router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "Welcome to Snap2Learn AI Backend API",
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_url": "/health",
        "api_health_url": "/api/health"
    }

@app.get("/ping", tags=["Health"])
def ping():
    return {"status": "ok", "message": "pong"}

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again or check backend logs."}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
