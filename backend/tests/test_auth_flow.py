import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import pytest
from starlette.testclient import TestClient
from unittest.mock import patch
from app.main import app
from app.services.storage_service import store

client = TestClient(app)


def test_send_otp_success():
    """Verify sending OTP dispatches email and saves code in store."""
    with patch("app.services.brevo_service.brevo_service.send_otp_email", return_value=True):
        response = client.post(
            "/api/auth/send-otp",
            json={"email": "student.aiml@college.edu", "name": "Aiml Student"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["email"] == "student.aiml@college.edu"
        assert "Verification code sent" in data["message"]


def test_send_otp_invalid_email():
    """Verify invalid email syntax is rejected with 422."""
    response = client.post(
        "/api/auth/send-otp",
        json={"email": "not-an-email", "name": "Student"}
    )
    assert response.status_code == 422


def test_verify_otp_success_and_jwt_generation():
    """Verify providing valid OTP returns JWT token and student profile."""
    test_email = "verify.test@aiml.edu"
    test_otp = "842915"
    store.save_otp(test_email, test_otp, expires_minutes=10)

    response = client.post(
        "/api/auth/verify-otp",
        json={"email": test_email, "otp": test_otp, "name": "Verify Student"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "token" in data and len(data["token"]) > 20
    assert data["user"]["email"] == test_email
    assert data["user"]["is_guest"] is False


def test_verify_otp_invalid_code():
    """Verify incorrect OTP is rejected with 400 Bad Request."""
    test_email = "invalid.code@aiml.edu"
    store.save_otp(test_email, "999999", expires_minutes=10)

    response = client.post(
        "/api/auth/verify-otp",
        json={"email": test_email, "otp": "000000"}
    )
    assert response.status_code == 400
    assert "Invalid or expired" in response.json()["detail"]


def test_get_current_user_me_valid_token():
    """Verify /api/auth/me decodes the bearer token properly."""
    test_email = "bearer.me@aiml.edu"
    test_otp = "654321"
    store.save_otp(test_email, test_otp, expires_minutes=10)

    verify_res = client.post(
        "/api/auth/verify-otp",
        json={"email": test_email, "otp": test_otp, "name": "Bearer User"}
    )
    token = verify_res.json()["token"]

    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    profile = me_res.json()
    assert profile["email"] == test_email
    assert profile["is_guest"] is False


def test_get_current_user_me_missing_token():
    """Verify missing authorization header returns 401 Unauthorized."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "Missing or invalid" in response.json()["detail"]


def test_get_current_user_me_invalid_token():
    """Verify invalid token string returns 401 Unauthorized."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid.malformed.jwt.token"}
    )
    assert response.status_code == 401


def test_forgot_password_success():
    """Verify forgot-password generates reset code and dispatches Brevo email."""
    test_email = "forgot.pass@aiml.edu"
    with patch("app.services.brevo_service.brevo_service.send_password_reset_email", return_value=True):
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": test_email}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["email"] == test_email
        assert "Password reset instructions" in data["message"]


def test_forgot_password_invalid_email():
    """Verify forgot-password rejects malformed email with 422."""
    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "bad-email"}
    )
    assert response.status_code == 422


def test_reset_password_with_valid_otp():
    """Verify reset-password with valid OTP updates user password."""
    test_email = "reset.valid@aiml.edu"
    test_otp = "432109"
    store.save_reset_token(test_email, "dummy-token", test_otp, expires_minutes=15)

    response = client.post(
        "/api/auth/reset-password",
        json={
            "email": test_email,
            "otp": test_otp,
            "new_password": "NewSecurePassword2026!"
        }
    )
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_reset_password_with_invalid_otp():
    """Verify reset-password with incorrect OTP returns 400 Bad Request."""
    test_email = "reset.wrong@aiml.edu"
    store.save_reset_token(test_email, "dummy-token", "111111", expires_minutes=15)

    response = client.post(
        "/api/auth/reset-password",
        json={
            "email": test_email,
            "otp": "222222",
            "new_password": "NewSecurePassword2026!"
        }
    )
    assert response.status_code == 400
    assert "Invalid or expired reset code" in response.json()["detail"]


def test_reset_password_short_password_validation():
    """Verify short passwords (<6 chars) are rejected with 422."""
    response = client.post(
        "/api/auth/reset-password",
        json={
            "email": "short.pass@aiml.edu",
            "otp": "123456",
            "new_password": "123"
        }
    )
    assert response.status_code == 422


def test_password_reset_and_login_flow():
    """Verify complete end-to-end flow: reset password -> login with new password."""
    test_email = "full.cycle@aiml.edu"
    test_otp = "777888"
    new_pw = "AimL_Engineering2026"

    # Step 1: Save reset code
    store.save_reset_token(test_email, "token-cycle", test_otp, expires_minutes=15)

    # Step 2: Reset password
    reset_res = client.post(
        "/api/auth/reset-password",
        json={"email": test_email, "otp": test_otp, "new_password": new_pw}
    )
    assert reset_res.status_code == 200

    # Step 3: Login with new password
    login_res = client.post(
        "/api/auth/login-password",
        json={"email": test_email, "password": new_pw}
    )
    assert login_res.status_code == 200
    data = login_res.json()
    assert data["success"] is True
    assert "token" in data
    assert data["user"]["email"] == test_email

    # Step 4: Login with incorrect password fails
    bad_login = client.post(
        "/api/auth/login-password",
        json={"email": test_email, "password": "WrongPassword"}
    )
    assert bad_login.status_code == 401


def test_login_password_unregistered_account():
    """Verify password login for unconfigured account returns 400."""
    response = client.post(
        "/api/auth/login-password",
        json={"email": "nobody.registered@aiml.edu", "password": "SomePassword123"}
    )
    assert response.status_code == 400
