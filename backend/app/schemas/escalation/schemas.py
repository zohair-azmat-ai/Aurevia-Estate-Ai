"""
Escalation schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import EscalationPriority, EscalationStatus, EscalationType
from app.schemas.common.base import ORMModel


class EscalationBase(BaseModel):
    lead_id: str
    escalation_type: EscalationType
    priority: EscalationPriority = EscalationPriority.MEDIUM
    reason: str
    trigger_confidence: float | None = None
    trigger_message: str | None = None
    assigned_agent: str | None = None
    assigned_team: str | None = None
    resolved_at: datetime | None = None
    resolution_notes: str | None = None
    status: EscalationStatus = EscalationStatus.PENDING


class EscalationCreate(EscalationBase):
    pass


class EscalationRead(EscalationBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class EscalationListResponse(BaseModel):
    items: list[EscalationRead]
    total: int
