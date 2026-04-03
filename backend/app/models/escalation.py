"""
Aurevia Estate AI - Escalation model.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import EscalationPriority, EscalationStatus, EscalationType


class Escalation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "escalations"
    __table_args__ = (
        Index("ix_escalations_status_priority", "status", "priority"),
    )

    lead_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    escalation_type: Mapped[EscalationType] = mapped_column(Enum(EscalationType), nullable=False)
    priority: Mapped[EscalationPriority] = mapped_column(
        Enum(EscalationPriority), default=EscalationPriority.MEDIUM, nullable=False, index=True
    )
    reason: Mapped[str] = mapped_column(String(255), nullable=False)
    trigger_confidence: Mapped[float | None]
    trigger_message: Mapped[str | None] = mapped_column(Text)
    assigned_agent: Mapped[str | None] = mapped_column(String(255))
    assigned_team: Mapped[str | None] = mapped_column(String(255))
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution_notes: Mapped[str | None] = mapped_column(Text)
    status: Mapped[EscalationStatus] = mapped_column(
        Enum(EscalationStatus), default=EscalationStatus.PENDING, nullable=False, index=True
    )

    lead: Mapped["Lead"] = relationship("Lead", back_populates="escalations")

    def __repr__(self) -> str:
        return f"<Escalation id={self.id} lead={self.lead_id} type={self.escalation_type.value}>"
