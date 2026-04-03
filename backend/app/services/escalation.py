"""
Escalation service implementation.
"""

from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.escalation import Escalation
from app.models.enums import EscalationPriority, EscalationStatus, EscalationType
from app.models.message import Message
from app.schemas.escalation.schemas import EscalationCreate


class EscalationService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def should_escalate(
        self,
        *,
        lead_budget: int | None,
        intent_confidence: float,
        sentiment: float,
        message_text: str,
        recent_messages: Sequence[Message],
    ) -> tuple[bool, EscalationType | None, str]:
        lowered = message_text.lower()
        if lead_budget and lead_budget >= settings.HIGH_BUDGET_THRESHOLD:
            return True, EscalationType.HIGH_BUDGET, "High-value opportunity"
        if sentiment <= settings.NEGATIVE_SENTIMENT_THRESHOLD:
            return True, EscalationType.NEGATIVE_SENTIMENT, "Negative sentiment detected"
        if intent_confidence < settings.ESCALATION_CONFIDENCE_THRESHOLD:
            return True, EscalationType.LOW_CONFIDENCE, "Confidence below threshold"
        if any(term in lowered for term in ["agent", "human", "call me", "manager"]):
            return True, EscalationType.EXPLICIT_REQUEST, "Explicit request for human support"
        if len(recent_messages) >= 4:
            return True, EscalationType.REPEATED_QUERY, "Repeated unresolved queries"
        return False, None, ""

    async def trigger(
        self,
        *,
        lead_id: str,
        escalation_type: EscalationType,
        reason: str,
        trigger_message: str,
        confidence: float,
        priority: EscalationPriority = EscalationPriority.HIGH,
    ) -> Escalation:
        escalation = Escalation(
            **EscalationCreate(
                lead_id=lead_id,
                escalation_type=escalation_type,
                priority=priority,
                reason=reason,
                trigger_confidence=confidence,
                trigger_message=trigger_message,
                status=EscalationStatus.PENDING,
            ).model_dump()
        )
        self.db.add(escalation)
        await self.db.flush()
        await self.db.refresh(escalation)
        return escalation

    async def list_escalations(self, skip: int = 0, limit: int = 50) -> tuple[list[Escalation], int]:
        total = await self.db.scalar(select(func.count()).select_from(Escalation)) or 0
        result = await self.db.execute(
            select(Escalation).order_by(Escalation.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all()), total
