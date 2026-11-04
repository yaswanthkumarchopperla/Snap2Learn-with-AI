import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend directory and workspace root if present
backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent.parent / ".env"
if root_env.exists():
    load_dotenv(dotenv_path=root_env)
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=True)

class Settings:
    PROJECT_NAME: str = "Snap2Learn AI Backend"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Snap. Understand. Practice. Master."

    @property
    def GEMINI_API_KEY(self) -> str:
        key = os.getenv("GEMINI_API_KEY", "").strip()
        if not key and backend_env.exists():
            load_dotenv(dotenv_path=backend_env, override=True)
            key = os.getenv("GEMINI_API_KEY", "").strip()
        return key

    @property
    def GEMINI_MODEL(self) -> str:
        model = os.getenv("GEMINI_MODEL", "").strip()
        # Automatically upgrade deprecated or quota-constrained models to working 3.5-flash-lite
        if not model or model in ("gemini-2.5-flash", "models/gemini-2.5-flash"):
            return "gemini-3.5-flash-lite"
        return model

    # Supabase configuration (optional)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "").strip()
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "").strip()

    # Upload constraints
    MAX_UPLOAD_SIZE_MB: int = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]

    # CORS configuration
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"  # Fallback for preview / dev
    ]

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY) > 10)

settings = Settings()
