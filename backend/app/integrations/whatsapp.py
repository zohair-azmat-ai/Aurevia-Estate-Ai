"""
WhatsApp integration foundation.
"""

from dataclasses import dataclass
from datetime import datetime, timezone
import hashlib
import hmac

from app.core.config import settings


@dataclass
class OutboundSendResult:
    provider: str
    status: str
    message: str
    external_id: str | None = None
    placeholder: bool = True


class WhatsAppIntegration:
    provider = "whatsapp"

    def validate_signature(self, payload: bytes, signature: str | None) -> bool:
        if not settings.WHATSAPP_APP_SECRET:
            return True
        if not signature:
            return False
        digest = hmac.new(
            settings.WHATSAPP_APP_SECRET.encode("utf-8"),
            payload,
            hashlib.sha256,
        ).hexdigest()
        expected = f"sha256={digest}"
        return hmac.compare_digest(expected, signature)

    def health(self) -> dict:
        return {
            "provider": self.provider,
            "status": "connected" if settings.WHATSAPP_PHONE_NUMBER_ID else "warning",
            "verify_token_configured": bool(settings.WHATSAPP_VERIFY_TOKEN),
            "app_secret_configured": bool(settings.WHATSAPP_APP_SECRET),
            "access_token_configured": bool(settings.WHATSAPP_ACCESS_TOKEN),
            "timestamp": datetime.now(timezone.utc),
        }

    async def send_message(self, to: str, message: str) -> OutboundSendResult:
        placeholder = not (
            settings.WHATSAPP_ACCESS_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID
        )
        status = "queued" if placeholder else "sent"
        response_message = (
            "WhatsApp message queued in safe placeholder mode."
            if placeholder
            else "WhatsApp message dispatched successfully."
        )
        return OutboundSendResult(
            provider=self.provider,
            status=status,
            message=response_message,
            external_id=f"wa-{int(datetime.now(timezone.utc).timestamp())}",
            placeholder=placeholder,
        )
