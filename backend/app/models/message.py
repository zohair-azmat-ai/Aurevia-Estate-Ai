"""
Aurevia Estate AI - Message model.
"""

from sqlalchemy import Boolean, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import Channel, MessageRole


class Message(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
    )

    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole), nullable=False, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    channel: Mapped[Channel] = mapped_column(Enum(Channel), nullable=False, index=True)
    is_ai_generated: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    ai_model: Mapped[str | None] = mapped_column(String(100))
    tokens_used: Mapped[int | None] = mapped_column(Integer)

    conversation: Mapped["Conversation"] = relationship(
        "Conversation", back_populates="messages"
    )

    def __repr__(self) -> str:
        return f"<Message id={self.id} role={self.role.value} conversation={self.conversation_id}>"
