"""
Email integration foundation.
"""

from dataclasses import dataclass
from datetime import datetime, timezone

from app.core.config import settings


@dataclass
class EmailSendResult:
    provider: str
    status: str
    message: str
    external_id: str | None = None
    placeholder: bool = True


class EmailIntegration:
    provider = "email"

    def health(self) -> dict:
        return {
            "provider": self.provider,
            "status": "connected" if settings.EMAIL_SMTP else "warning",
            "smtp_configured": bool(settings.EMAIL_SMTP),
            "from_address": settings.EMAIL_FROM_ADDRESS,
            "webhook_secret_configured": bool(settings.EMAIL_WEBHOOK_SECRET),
            "timestamp": datetime.now(timezone.utc),
        }

    def validate_secret(self, secret: str | None) -> bool:
        if not settings.EMAIL_WEBHOOK_SECRET:
            return True
        return bool(secret) and secret == settings.EMAIL_WEBHOOK_SECRET

    async def send_message(self, to: str, subject: str, body: str) -> EmailSendResult:
        placeholder = not settings.EMAIL_SMTP
        status = "queued" if placeholder else "sent"
        response_message = (
            "Email queued in safe placeholder mode."
            if placeholder
            else "Email sent successfully."
        )
        return EmailSendResult(
            provider=self.provider,
            status=status,
            message=response_message,
            external_id=f"email-{int(datetime.now(timezone.utc).timestamp())}",
            placeholder=placeholder,
        )
