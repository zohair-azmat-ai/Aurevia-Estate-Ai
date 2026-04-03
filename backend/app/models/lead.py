"""
Aurevia Estate AI - Lead model.
"""

from sqlalchemy import Boolean, Enum, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import Channel, IntentType, LeadStatus, PropertyType, TransactionType


class Lead(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leads"
    __table_args__ = (
        Index("ix_leads_name_status", "name", "status"),
        Index("ix_leads_channel_created", "channel", "created_at"),
    )

    name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(50), index=True)
    channel: Mapped[Channel] = mapped_column(Enum(Channel), nullable=False, index=True)

    intent: Mapped[IntentType | None] = mapped_column(Enum(IntentType))
    intent_confidence: Mapped[float | None]
    property_type: Mapped[PropertyType | None] = mapped_column(Enum(PropertyType))
    transaction_type: Mapped[TransactionType | None] = mapped_column(Enum(TransactionType))
    location_preference: Mapped[str | None] = mapped_column(String(255), index=True)
    budget_min: Mapped[int | None] = mapped_column(Integer, index=True)
    budget_max: Mapped[int | None] = mapped_column(Integer, index=True)
    budget_currency: Mapped[str] = mapped_column(String(10), default="AED", nullable=False)
    bedrooms: Mapped[int | None] = mapped_column(Integer)

    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus), default=LeadStatus.NEW, nullable=False, index=True
    )
    is_escalated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    escalation_reason: Mapped[str | None] = mapped_column(Text)
    ai_summary: Mapped[str | None] = mapped_column(Text)
    source_metadata: Mapped[str | None] = mapped_column(Text)

    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation", back_populates="lead", cascade="all, delete-orphan"
    )
    follow_ups: Mapped[list["FollowUp"]] = relationship(
        "FollowUp", back_populates="lead", cascade="all, delete-orphan"
    )
    escalations: Mapped[list["Escalation"]] = relationship(
        "Escalation", back_populates="lead", cascade="all, delete-orphan"
    )
    events: Mapped[list["Event"]] = relationship(
        "Event", back_populates="lead", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Lead id={self.id} name={self.name} status={self.status.value}>"
