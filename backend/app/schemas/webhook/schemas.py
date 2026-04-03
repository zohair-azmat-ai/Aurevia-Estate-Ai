"""
Webhook schemas.
"""

from pydantic import BaseModel


class WhatsAppWebhookPayload(BaseModel):
    from_number: str
    message: str
    profile_name: str | None = None
    external_thread_id: str | None = None


class EmailWebhookPayload(BaseModel):
    from_email: str
    subject: str | None = None
    body: str
    sender_name: str | None = None
    external_thread_id: str | None = None
