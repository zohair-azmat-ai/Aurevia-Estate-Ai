"""
Channel webhook orchestration service.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.email import EmailIntegration
from app.integrations.whatsapp import WhatsAppIntegration
from app.models.enums import Channel, EventType
from app.orchestrator.pipeline import InboundMessage, OrchestratorService
from app.services.analytics import AnalyticsService


class ChannelService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.orchestrator = OrchestratorService(db)
        self.analytics = AnalyticsService(db)
        self.whatsapp = WhatsAppIntegration()
        self.email = EmailIntegration()

    async def process_whatsapp(
        self,
        *,
        from_number: str,
        message: str,
        profile_name: str | None = None,
        external_thread_id: str | None = None,
    ) -> dict:
        result = await self.orchestrator.process(
            InboundMessage(
                channel=Channel.WHATSAPP,
                content=message,
                name=profile_name,
                phone=from_number,
                external_thread_id=external_thread_id or from_number,
            )
        )
        await self.analytics.log(
            EventType.WHATSAPP_WEBHOOK_RECEIVED,
            lead_id=result["lead_id"],
            channel=Channel.WHATSAPP,
            payload={"from_number": from_number},
        )
        return result

    async def process_email(
        self,
        *,
        from_email: str,
        body: str,
        sender_name: str | None = None,
        subject: str | None = None,
        external_thread_id: str | None = None,
    ) -> dict:
        result = await self.orchestrator.process(
            InboundMessage(
                channel=Channel.EMAIL,
                content=f"{subject or 'Email inquiry'}\n\n{body}",
                name=sender_name,
                email=from_email,
                external_thread_id=external_thread_id or from_email,
            )
        )
        await self.analytics.log(
            EventType.EMAIL_RECEIVED,
            lead_id=result["lead_id"],
            channel=Channel.EMAIL,
            payload={"from_email": from_email, "subject": subject},
        )
        return result
