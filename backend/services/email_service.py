"""
Email delivery helpers.

When SMTP is not configured, the service falls back to a preview response so
the frontend can still show what would have been sent.
"""

from email.message import EmailMessage
from typing import Any, Dict
import os
import smtplib


class EmailService:
    def __init__(self) -> None:
        self.host = os.getenv("SMTP_HOST", "").strip()
        self.port = int(os.getenv("SMTP_PORT", "587"))
        self.username = os.getenv("SMTP_USERNAME", "").strip()
        self.password = os.getenv("SMTP_PASSWORD", "").strip()
        self.use_tls = os.getenv("SMTP_USE_TLS", "true").lower() != "false"
        self.from_email = os.getenv("SMTP_FROM_EMAIL", self.username).strip()
        self.from_name = os.getenv(
            "SMTP_FROM_NAME",
            "Behavioral Pattern Analysis Framework",
        ).strip()

    def is_configured(self) -> bool:
        return all([self.host, self.username, self.password, self.from_email])

    def _build_preview(self, to_email: str, subject: str, body: str) -> str:
        return f"To: {to_email}\nSubject: {subject}\n\n{body}"

    def send_email(self, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        """Send an email or provide a simulation preview when SMTP is unavailable."""
        preview = self._build_preview(to_email, subject, body)

        if not self.is_configured():
            return {
                "delivered": False,
                "mode": "simulated",
                "message": "SMTP is not configured. Preview generated for development.",
                "preview": preview,
            }

        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email
        message.set_content(body)

        try:
            with smtplib.SMTP(self.host, self.port, timeout=10) as smtp:
                if self.use_tls:
                    smtp.starttls()
                smtp.login(self.username, self.password)
                smtp.send_message(message)

            return {
                "delivered": True,
                "mode": "smtp",
                "message": "Email sent successfully.",
            }
        except Exception as exc:
            return {
                "delivered": False,
                "mode": "simulated",
                "message": f"SMTP delivery failed: {exc}",
                "preview": preview,
            }

    def send_welcome_email(self, name: str, to_email: str) -> Dict[str, Any]:
        subject = "Welcome to Behavioral Pattern Analysis Framework"
        body = (
            f"Hi {name},\n\n"
            "Your account is ready.\n"
            "You can now sign in to your dashboard and review your privacy-first "
            "behavioral insights.\n\n"
            "If you did not create this account, please ignore this message.\n\n"
            "Team Behavioral Pattern Analysis Framework"
        )
        return self.send_email(to_email, subject, body)

    def send_temporary_password_email(
        self,
        name: str,
        to_email: str,
        temporary_password: str,
    ) -> Dict[str, Any]:
        subject = "Your temporary password"
        body = (
            f"Hi {name},\n\n"
            "We received a password reset request for your account.\n"
            "Use the temporary password below to sign in:\n\n"
            f"{temporary_password}\n\n"
            "After signing in, please generate and save a new secure password.\n"
            "If you did not request this reset, contact support and ignore this email.\n\n"
            "Team Behavioral Pattern Analysis Framework"
        )
        return self.send_email(to_email, subject, body)
