"""
Aurevia Estate AI - Analytics event model.
"""

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import Channel, EventType


class Event(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "events"
    __table_args__ = (
        Index("ix_events_event_type_created", "event_type", "created_at"),
    )

    lead_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("leads.id", ondelete="SET NULL"), index=True
    )
    event_type: Mapped[EventType] = mapped_column(Enum(EventType), nullable=False, index=True)
    channel: Mapped[Channel | None] = mapped_column(Enum(Channel))
    payload: Mapped[str | None] = mapped_column(Text)

    lead: Mapped["Lead | None"] = relationship("Lead", back_populates="events")

    def __repr__(self) -> str:
        return f"<Event id={self.id} type={self.event_type.value}>"
