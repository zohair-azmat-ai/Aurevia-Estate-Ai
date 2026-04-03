"""
Lead schemas.
"""

from datetime import datetime

from pydantic import BaseModel

from app.models.enums import Channel, IntentType, LeadStatus, PropertyType, TransactionType
from app.schemas.common.base import ORMModel


class LeadBase(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    channel: Channel
    intent: IntentType | None = None
    intent_confidence: float | None = None
    property_type: PropertyType | None = None
    transaction_type: TransactionType | None = None
    location_preference: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    budget_currency: str = "AED"
    bedrooms: int | None = None
    status: LeadStatus = LeadStatus.NEW
    is_escalated: bool = False
    escalation_reason: str | None = None
    ai_summary: str | None = None
    source_metadata: str | None = None


class LeadCreate(LeadBase):
    pass


class LeadUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    intent: IntentType | None = None
    intent_confidence: float | None = None
    property_type: PropertyType | None = None
    transaction_type: TransactionType | None = None
    location_preference: str | None = None
    budget_min: int | None = None
    budget_max: int | None = None
    budget_currency: str | None = None
    bedrooms: int | None = None
    status: LeadStatus | None = None
    is_escalated: bool | None = None
    escalation_reason: str | None = None
    ai_summary: str | None = None
    source_metadata: str | None = None


class LeadRead(LeadBase, ORMModel):
    id: str
    created_at: datetime
    updated_at: datetime


class LeadListResponse(BaseModel):
    items: list[LeadRead]
    total: int
