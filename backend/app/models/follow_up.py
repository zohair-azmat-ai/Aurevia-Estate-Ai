"""
Aurevia Estate AI - Follow-up model.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import Channel, FollowUpStatus


class FollowUp(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "follow_ups"
    __table_args__ = (
        Index("ix_follow_ups_status_scheduled", "status", "scheduled_at"),
    )

    lead_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    channel: Mapped[Channel] = mapped_column(Enum(Channel), nullable=False, index=True)
    message_template: Mapped[str] = mapped_column(Text, nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    executed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[FollowUpStatus] = mapped_column(
        Enum(FollowUpStatus), default=FollowUpStatus.PENDING, nullable=False, index=True
    )
    attempt_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text)
    next_action: Mapped[str | None] = mapped_column(String(255))

    lead: Mapped["Lead"] = relationship("Lead", back_populates="follow_ups")

    def __repr__(self) -> str:
        return f"<FollowUp id={self.id} lead={self.lead_id} status={self.status.value}>"
