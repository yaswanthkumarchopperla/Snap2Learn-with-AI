import random
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, status
from pydantic import BaseModel, field_validator
import jwt

from app.core.config import settings
from app.services.storage_service import store
from app.services.brevo_service import brevo_service

logger = logging.getLogger("snap2learn.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])


# -------------------------------------------------------------
# Request & Response Models
# -------------------------------------------------------------
class SendOtpRequest(BaseModel):
    email: str
    name: Optional[str] = None

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email format")
        return clean


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str
    name: Optional[str] = None

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email format")
        return clean


class AuthUserResponse(BaseModel):
    id: str
    email: str
    name: str
    college_branch: str = "CSE (AI & ML)"
    is_guest: bool = False


class AuthSuccessResponse(BaseModel):
    success: bool
    token: str
    user: AuthUserResponse
    message: str = "Authentication successful"


# -------------------------------------------------------------
# JWT Helper Functions
# -------------------------------------------------------------
def create_access_token(user_id: str, email: str, name: str, is_guest: bool = False) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "name": name,
        "is_guest": is_guest,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.post("/send-otp")
def send_otp(request: SendOtpRequest):
    """Generates a secure 6-digit OTP, stores it in MongoDB, and delivers it via Brevo email."""
    email_clean = str(request.email).lower().strip()
    otp_code = f"{random.randint(100000, 999999)}"

    # Save to MongoDB
    saved = store.save_otp(email_clean, otp_code, expires_minutes=10)

    # Deliver via Brevo transactional email
    sent = brevo_service.send_otp_email(
        to_email=email_clean,
        otp=otp_code,
        student_name=request.name
    )

    if not sent and brevo_service.is_configured:
        logger.error(f"Failed to deliver OTP to {email_clean} via Brevo")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please check the email address or try again shortly."
        )

    return {
        "success": True,
        "message": f"Verification code sent to {email_clean}. Please check your inbox.",
        "email": email_clean
    }


@router.post("/verify-otp", response_model=AuthSuccessResponse)
def verify_otp(request: VerifyOtpRequest):
    """Verifies the 6-digit OTP, updates MongoDB user records, and issues a persistent JWT session token."""
    email_clean = str(request.email).lower().strip()
    code_clean = request.otp.strip()

    valid = store.verify_otp(email_clean, code_clean)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new OTP."
        )

    # Create or update user in MongoDB
    user_doc = store.get_or_create_user(email_clean, request.name)
    user_id = user_doc.get("id") or str(user_doc.get("_id"))
    display_name = user_doc.get("name") or email_clean.split("@")[0].capitalize()
    branch = user_doc.get("college_branch", "CSE (AI & ML)")

    token = create_access_token(user_id=user_id, email=email_clean, name=display_name, is_guest=False)

    return AuthSuccessResponse(
        success=True,
        token=token,
        user=AuthUserResponse(
            id=user_id,
            email=email_clean,
            name=display_name,
            college_branch=branch,
            is_guest=False
        ),
        message="Login verified successfully via Brevo and MongoDB"
    )


@router.get("/me", response_model=AuthUserResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    """Returns the authenticated user's profile from the JWT session token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again."
        )

    return AuthUserResponse(
        id=payload.get("sub", "guest"),
        email=payload.get("email", ""),
        name=payload.get("name", "Student"),
        college_branch="CSE (AI & ML)",
        is_guest=payload.get("is_guest", False)
    )


@router.post("/guest", response_model=AuthSuccessResponse)
def login_as_guest():
    """Provides instant guest access for trial and interactive scanner tests."""
    guest_id = "guest-aiml-2026"
    guest_email = "student@aiml.college.edu"
    guest_name = "First-Year CSE-AIML Student"
    token = create_access_token(user_id=guest_id, email=guest_email, name=guest_name, is_guest=True)

    return AuthSuccessResponse(
        success=True,
        token=token,
        user=AuthUserResponse(
            id=guest_id,
            email=guest_email,
            name=guest_name,
            college_branch="CSE (AI & ML)",
            is_guest=True
        ),
        message="Guest session initialized"
    )
