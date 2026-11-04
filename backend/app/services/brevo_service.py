import logging
from typing import Optional, List, Dict, Any
import httpx
from app.core.config import settings

logger = logging.getLogger("snap2learn.brevo")

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


class BrevoService:
    def __init__(self):
        self._api_key = settings.BREVO_API_KEY
        self._sender_email = settings.BREVO_SENDER_EMAIL
        self._sender_name = settings.BREVO_SENDER_NAME

    @property
    def is_configured(self) -> bool:
        return bool(settings.BREVO_API_KEY and len(settings.BREVO_API_KEY) > 10)

    def send_otp_email(self, to_email: str, otp: str, student_name: Optional[str] = None) -> bool:
        """Sends a 6-digit verification OTP code to the student's email via Brevo."""
        if not self.is_configured:
            logger.warning("Brevo API key is not configured; skipping email dispatch")
            return False

        greeting = f"Hi {student_name}," if student_name else "Hello Student,"
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; margin: 0; padding: 24px; }}
            .container {{ max-width: 540px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }}
            .logo {{ font-size: 22px; font-weight: 800; color: #818cf8; letter-spacing: -0.5px; margin-bottom: 24px; }}
            .logo span {{ color: #38bdf8; }}
            h2 {{ font-size: 20px; font-weight: 700; margin-top: 0; color: #f8fafc; }}
            p {{ font-size: 14px; line-height: 1.6; color: #94a3b8; }}
            .otp-box {{ background: #1e293b; border: 2px dashed #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }}
            .otp-code {{ font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #38bdf8; font-family: monospace; }}
            .warning {{ font-size: 12px; color: #64748b; margin-top: 20px; text-align: center; }}
            .footer {{ border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 16px; font-size: 11px; color: #475569; text-align: center; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">Snap2Learn<span>AI</span></div>
            <h2>Verification Code</h2>
            <p>{greeting}</p>
            <p>Use the 6-digit one-time password (OTP) below to authenticate into your Snap2Learn AI study workspace:</p>
            
            <div class="otp-box">
              <div class="otp-code">{otp}</div>
            </div>

            <p style="text-align: center; color: #cbd5e1; font-size: 13px;">This code will expire in <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <p class="warning">If you did not request this verification code, you can safely ignore this email.</p>

            <div class="footer">
              Snap2Learn AI • Multimodal CSE-AIML Academic Study Suite
            </div>
          </div>
        </body>
        </html>
        """

        payload = {
            "sender": {
                "name": settings.BREVO_SENDER_NAME,
                "email": settings.BREVO_SENDER_EMAIL
            },
            "to": [
                {
                    "email": to_email,
                    "name": student_name or to_email.split("@")[0]
                }
            ],
            "subject": f"{otp} is your Snap2Learn AI Verification Code",
            "htmlContent": html_content
        }

        headers = {
            "api-key": settings.BREVO_API_KEY,
            "Content-Type": "application/json",
            "accept": "application/json"
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.post(BREVO_API_URL, json=payload, headers=headers)
                if response.status_code in (200, 201, 202):
                    logger.info(f"Brevo successfully delivered OTP email to {to_email}")
                    return True
                else:
                    logger.error(f"Brevo API error ({response.status_code}): {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Failed to deliver Brevo OTP email to {to_email}: {e}")
            return False

    def send_study_report_email(
        self,
        to_email: str,
        subject: str,
        topic: str,
        score_percentage: float,
        correct_count: int,
        total_questions: int,
        weak_topics: Optional[List[str]] = None
    ) -> bool:
        """Sends student a quiz scorecard and review feedback via Brevo."""
        if not self.is_configured:
            return False

        weak_list = "".join([f"<li>{wt}</li>" for wt in (weak_topics or [])])
        weak_section = f"<div style='margin-top: 16px;'><strong>Concepts to review:</strong><ul>{weak_list}</ul></div>" if weak_topics else ""

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; background: #0b0f19; color: #f8fafc; padding: 24px;">
          <div style="max-width: 540px; margin: 0 auto; background: #131b2e; border-radius: 12px; padding: 24px;">
            <h2 style="color: #38bdf8; margin-top: 0;">Snap2Learn AI Quiz Scorecard</h2>
            <p><strong>Subject:</strong> {subject}</p>
            <p><strong>Topic:</strong> {topic}</p>
            <div style="background: #1e293b; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: {'#22c55e' if score_percentage >= 60 else '#ef4444'}; margin: 0;">{score_percentage:.1f}%</h1>
              <p style="margin: 4px 0 0; color: #94a3b8;">{correct_count} of {total_questions} questions correct</p>
            </div>
            {weak_section}
            <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">Keep practicing to master your first-year university exams!</p>
          </div>
        </body>
        </html>
        """

        payload = {
            "sender": {"name": settings.BREVO_SENDER_NAME, "email": settings.BREVO_SENDER_EMAIL},
            "to": [{"email": to_email}],
            "subject": f"Quiz Results ({score_percentage:.0f}%): {topic} - Snap2Learn AI",
            "htmlContent": html_content
        }

        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(BREVO_API_URL, json=payload, headers={"api-key": settings.BREVO_API_KEY, "Content-Type": "application/json"})
                return res.status_code in (200, 201, 202)
        except Exception as e:
            logger.error(f"Failed to send quiz report via Brevo: {e}")
            return False


brevo_service = BrevoService()

