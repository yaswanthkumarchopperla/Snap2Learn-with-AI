import random
import logging
import hashlib
import secrets
import urllib.parse
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Request, status
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


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email format")
        return clean


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    new_password: str

    @field_validator("email")
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if "@" not in clean or "." not in clean.split("@")[-1]:
            raise ValueError("Invalid email format")
        return clean

    @field_validator("new_password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        return v


class LoginPasswordRequest(BaseModel):
    email: str
    password: str

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
# Password & JWT Helpers
# -------------------------------------------------------------
def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"


def verify_password(stored: str, provided: str) -> bool:
    try:
        salt, key_hex = stored.split(":")
        key = hashlib.pbkdf2_hmac("sha256", provided.encode("utf-8"), salt.encode("utf-8"), 100000)
        return secrets.compare_digest(key.hex(), key_hex)
    except Exception:
        return False


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


def get_optional_current_user(authorization: Optional[str] = Header(None)) -> Optional[AuthUserResponse]:
    """Optionally returns authenticated user profile, or None if unauthenticated."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    try:
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if not payload:
            return None
        return AuthUserResponse(
            id=payload.get("sub", "guest"),
            email=payload.get("email", ""),
            name=payload.get("name", "Student"),
            college_branch="CSE (AI & ML)",
            is_guest=payload.get("is_guest", False)
        )
    except Exception:
        return None


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, raw_req: Request):
    """Sends a 6-digit password reset OTP and direct link to the user's email via Brevo."""
    email_clean = str(request.email).lower().strip()
    otp_code = f"{random.randint(100000, 999999)}"
    reset_token = secrets.token_urlsafe(32)

    # Save to storage (MongoDB / in-memory)
    store.save_reset_token(email_clean, reset_token, otp_code, expires_minutes=15)

    # Determine frontend reset link base
    origin = raw_req.headers.get("origin") or raw_req.headers.get("referer")
    if origin:
        # Strip trailing slash or path
        origin = origin.split("?")[0].rstrip("/")
        if "/reset-password" in origin:
            origin = origin.replace("/reset-password", "")
    else:
        origin = "https://snap2-learn-with-ai.vercel.app"

    reset_link = f"{origin}/reset-password?email={urllib.parse.quote(email_clean)}&otp={otp_code}"

    # Get user's name if registered
    user_doc = store.get_user_by_email(email_clean)
    user_name = user_doc.get("name") if user_doc else None

    # Send email via Brevo
    sent = brevo_service.send_password_reset_email(
        to_email=email_clean,
        otp=otp_code,
        reset_link=reset_link,
        student_name=user_name
    )

    if not sent and brevo_service.is_configured:
        logger.error(f"Failed to deliver reset password email to {email_clean} via Brevo")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send password reset email. Please try again shortly."
        )

    return {
        "success": True,
        "message": f"Password reset instructions and verification code sent to {email_clean}.",
        "email": email_clean
    }


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    """Verifies the reset OTP and sets a new password for the user."""
    email_clean = str(request.email).lower().strip()
    code_clean = request.otp.strip()

    valid = store.verify_reset_otp(email_clean, code_clean)
    if not valid:
        # Also check standard OTP store as fallback
        valid = store.verify_otp(email_clean, code_clean)

    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code. Please request a new password reset."
        )

    # Hash new password
    hashed = hash_password(request.new_password)
    store.set_user_password(email_clean, hashed)

    return {
        "success": True,
        "message": "Password updated successfully. You can now log in with your new password."
    }


@router.post("/login-password", response_model=AuthSuccessResponse)
def login_with_password(request: LoginPasswordRequest):
    """Authenticates existing user with email and password."""
    email_clean = str(request.email).lower().strip()
    user_doc = store.get_user_by_email(email_clean)

    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No password configured for this account. Please use OTP login or reset your password."
        )

    if not verify_password(user_doc["password_hash"], request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password. Please verify your credentials."
        )

    user_id = user_doc.get("id") or str(user_doc.get("_id", "usr-aiml"))
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
        message="Login successful"
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
