"""
Production intake orchestration pipeline.
"""

from dataclasses import dataclass

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import Channel, EventType, EscalationPriority, LeadStatus, MessageRole
from app.rag.service import RAGService
from app.schemas.conversation.schemas import ConversationCreate
from app.schemas.lead.schemas import LeadUpdate
from app.schemas.message.schemas import MessageCreate
from app.services.analytics import AnalyticsService
from app.services.conversation.service import ConversationService
from app.services.crm import CRMService
from app.services.escalation import EscalationService
from app.services.extraction import ExtractionService
from app.services.follow_up import FollowUpService
from app.services.intent import IntentService
from app.services.lead.service import LeadService
from app.services.message.service import MessageService


@dataclass
class InboundMessage:
    channel: Channel
    content: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    external_thread_id: str | None = None


class OrchestratorService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db
        self.lead_service = LeadService(db)
        self.crm_service = CRMService(self.lead_service)
        self.conversation_service = ConversationService(db)
        self.message_service = MessageService(db)
        self.analytics_service = AnalyticsService(db)
        self.follow_up_service = FollowUpService(db)
        self.escalation_service = EscalationService(db)
        self.intent_service = IntentService()
        self.extraction_service = ExtractionService()
        self.rag_service = RAGService()

    async def process(self, inbound: InboundMessage) -> dict:
        intent_result = await self.intent_service.detect(inbound.content)
        extraction_result = await self.extraction_service.extract(inbound.content)

        lead = await self.crm_service.upsert_lead(
            inbound.channel,
            {"name": inbound.name, "email": inbound.email, "phone": inbound.phone},
            {
                **extraction_result.model_dump(),
                "intent": intent_result.intent,
                "intent_confidence": intent_result.confidence,
            },
        )
        await self.analytics_service.log(
            EventType.LEAD_CREATED, lead_id=lead.id, channel=inbound.channel
        )
        await self.analytics_service.log(
            EventType.INTENT_DETECTED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload=intent_result.model_dump(),
        )
        await self.analytics_service.log(
            EventType.EXTRACTION_COMPLETED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload=extraction_result.model_dump(),
        )

        conversation = await self.conversation_service.create_conversation(
            ConversationCreate(
                lead_id=lead.id,
                channel=inbound.channel,
                external_thread_id=inbound.external_thread_id,
                summary=inbound.content[:240],
            )
        )

        inbound_message = await self.message_service.store_message(
            MessageCreate(
                conversation_id=conversation.id,
                role=MessageRole.USER,
                content=inbound.content,
                channel=inbound.channel,
                is_ai_generated=False,
            )
        )
        await self.analytics_service.log(
            EventType.MESSAGE_RECEIVED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload={"message_id": inbound_message.id},
        )

        rag_context = await self.rag_service.retrieve(inbound.content)
        await self.analytics_service.log(
            EventType.RAG_RETRIEVED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload={"matches": len(rag_context)},
        )

        reply = self._compose_reply(lead.name, inbound.content, rag_context)
        outbound_message = await self.message_service.store_message(
            MessageCreate(
                conversation_id=conversation.id,
                role=MessageRole.ASSISTANT,
                content=reply,
                channel=inbound.channel,
                is_ai_generated=True,
                ai_model="gpt-4o",
                tokens_used=len(reply.split()),
            )
        )
        await self.analytics_service.log(
            EventType.REPLY_GENERATED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload={"message_id": outbound_message.id},
        )

        history, _ = await self.message_service.list_messages(conversation.id)
        should_escalate, escalation_type, escalation_reason = await self.escalation_service.should_escalate(
            lead_budget=lead.budget_max or lead.budget_min,
            intent_confidence=intent_result.confidence,
            sentiment=intent_result.sentiment,
            message_text=inbound.content,
            recent_messages=history,
        )

        escalation = None
        if should_escalate and escalation_type is not None:
            escalation = await self.escalation_service.trigger(
                lead_id=lead.id,
                escalation_type=escalation_type,
                reason=escalation_reason,
                trigger_message=inbound.content,
                confidence=intent_result.confidence,
                priority=EscalationPriority.CRITICAL
                if intent_result.sentiment < -0.5
                else EscalationPriority.HIGH,
            )
            await self.crm_service.update_status(lead.id, LeadStatus.ESCALATED)
            await self.lead_service.update_lead(
                lead,
                LeadUpdate(
                    is_escalated=True,
                    escalation_reason=escalation_reason,
                    ai_summary=reply,
                ),
            )
            await self.analytics_service.log(
                EventType.ESCALATION_TRIGGERED,
                lead_id=lead.id,
                channel=inbound.channel,
                payload={"escalation_id": escalation.id, "reason": escalation_reason},
            )
        else:
            await self.crm_service.update_status(lead.id, LeadStatus.CONTACTED)
            await self.lead_service.update_lead(lead, LeadUpdate(ai_summary=reply))

        follow_up = await self.follow_up_service.schedule(
            lead_id=lead.id,
            channel=inbound.channel,
            message_template=reply,
            next_action="Continue qualification and schedule next touchpoint",
        )
        await self.analytics_service.log(
            EventType.FOLLOWUP_SCHEDULED,
            lead_id=lead.id,
            channel=inbound.channel,
            payload={"follow_up_id": follow_up.id},
        )

        return {
            "lead_id": lead.id,
            "conversation_id": conversation.id,
            "reply": reply,
            "intent": intent_result.intent,
            "intent_confidence": intent_result.confidence,
            "structured_data": extraction_result.model_dump(),
            "rag_results": [item.model_dump() for item in rag_context],
            "escalation_id": escalation.id if escalation else None,
            "follow_up_id": follow_up.id,
        }

    def _compose_reply(self, lead_name: str | None, message: str, rag_context) -> str:
        greeting = f"Hi {lead_name}," if lead_name else "Hello,"
        if rag_context:
            context_line = rag_context[0].content[:160]
            return (
                f"{greeting} thanks for reaching out to Aurevia Estate AI. "
                f"Based on your request, here is the strongest matching guidance we have right now: "
                f"{context_line}. I can continue with tailored options and next steps immediately."
            )
        return (
            f"{greeting} thank you for your message. I have captured your requirements and "
            "am preparing the most relevant next step, including matching options and follow-up guidance."
        )
