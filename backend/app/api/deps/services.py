"""
Reusable API service dependencies.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.analytics import AnalyticsService
from app.services.conversation.service import ConversationService
from app.services.escalation import EscalationService
from app.services.follow_up import FollowUpService
from app.services.knowledge.service import KnowledgeService
from app.services.lead.service import LeadService
from app.services.message.service import MessageService


def get_lead_service(db: AsyncSession) -> LeadService:
    return LeadService(db)


def get_conversation_service(db: AsyncSession) -> ConversationService:
    return ConversationService(db)


def get_message_service(db: AsyncSession) -> MessageService:
    return MessageService(db)


def get_follow_up_service(db: AsyncSession) -> FollowUpService:
    return FollowUpService(db)


def get_escalation_service(db: AsyncSession) -> EscalationService:
    return EscalationService(db)


def get_knowledge_service(db: AsyncSession) -> KnowledgeService:
    return KnowledgeService(db)


def get_analytics_service(db: AsyncSession) -> AnalyticsService:
    return AnalyticsService(db)
