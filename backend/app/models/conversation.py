"""
Aurevia Estate AI - Conversation model.
"""

from sqlalchemy import Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import Channel, ConversationStatus


class Conversation(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_lead_channel", "lead_id", "channel"),
    )

    lead_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("leads.id", ondelete="CASCADE"), nullable=False, index=True
    )
    channel: Mapped[Channel] = mapped_column(Enum(Channel), nullable=False, index=True)
    status: Mapped[ConversationStatus] = mapped_column(
        Enum(ConversationStatus),
        default=ConversationStatus.OPEN,
        nullable=False,
        index=True,
    )
    external_thread_id: Mapped[str | None] = mapped_column(String(255), index=True)
    summary: Mapped[str | None] = mapped_column(Text)

    lead: Mapped["Lead"] = relationship("Lead", back_populates="conversations")
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )

    def __repr__(self) -> str:
        return f"<Conversation id={self.id} lead={self.lead_id} channel={self.channel.value}>"
