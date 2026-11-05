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
        # Automatically upgrade deprecated or quota-constrained models to stable working flash-lite
        deprecated_models = (
            "gemini-2.5-flash",
            "models/gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
        )
        if not model or model in deprecated_models:
            return "gemini-3.1-flash-lite"
        return model

    # Fallback model candidate chain for handling 503 / 429 transient model spikes
    GEMINI_FALLBACK_MODELS: list = [
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
    ]

    # MongoDB Atlas configuration
    @property
    def MONGODB_URI(self) -> str:
        return os.getenv("MONGODB_URI", "").strip()

    @property
    def MONGODB_DB_NAME(self) -> str:
        return os.getenv("MONGODB_DB_NAME", "snap2learn").strip()

    @property
    def is_mongodb_configured(self) -> bool:
        return bool(self.MONGODB_URI and "mongodb" in self.MONGODB_URI)

    # Brevo configuration (Transactional Email & OTP Auth)
    @property
    def BREVO_API_KEY(self) -> str:
        return os.getenv("BREVO_API_KEY", "").strip()

    @property
    def BREVO_SENDER_EMAIL(self) -> str:
        return os.getenv("BREVO_SENDER_EMAIL", "chopperlapurnima@gmail.com").strip()

    @property
    def BREVO_SENDER_NAME(self) -> str:
        return os.getenv("BREVO_SENDER_NAME", "Snap2Learn AI").strip()

    @property
    def is_brevo_configured(self) -> bool:
        return bool(self.BREVO_API_KEY and len(self.BREVO_API_KEY) > 10)

    # JWT Secret for Session Tokens
    @property
    def JWT_SECRET(self) -> str:
        return os.getenv("JWT_SECRET", "snap2learn_jwt_secret_key_default_2026").strip()

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
