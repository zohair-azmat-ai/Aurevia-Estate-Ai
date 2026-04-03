"""
Webhook endpoints for channel integrations.
"""

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.integrations.email import EmailIntegration
from app.integrations.whatsapp import WhatsAppIntegration
from app.schemas.webhook.schemas import EmailWebhookPayload, WhatsAppWebhookPayload
from app.services.channel import ChannelService

router = APIRouter(prefix="/webhooks")


@router.post("/whatsapp", summary="Receive WhatsApp webhook")
async def receive_whatsapp_webhook(
    request: Request,
    payload: WhatsAppWebhookPayload,
    x_hub_signature_256: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    integration = WhatsAppIntegration()
    body = await request.body()
    if not integration.validate_signature(body, x_hub_signature_256):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")
    result = await ChannelService(db).process_whatsapp(
        from_number=payload.from_number,
        message=payload.message,
        profile_name=payload.profile_name,
        external_thread_id=payload.external_thread_id,
    )
    return {"status": "accepted", **result}


@router.get("/whatsapp/health", summary="WhatsApp webhook health")
async def whatsapp_health():
    return WhatsAppIntegration().health()


@router.post("/email", summary="Receive email webhook")
async def receive_email_webhook(
    payload: EmailWebhookPayload,
    x_email_webhook_secret: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    integration = EmailIntegration()
    if not integration.validate_secret(x_email_webhook_secret):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email webhook secret")
    result = await ChannelService(db).process_email(
        from_email=payload.from_email,
        body=payload.body,
        sender_name=payload.sender_name,
        subject=payload.subject,
        external_thread_id=payload.external_thread_id,
    )
    return {"status": "accepted", **result}


@router.get("/email/health", summary="Email webhook health")
async def email_health():
    return EmailIntegration().health()
