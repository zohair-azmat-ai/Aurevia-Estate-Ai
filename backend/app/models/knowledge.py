"""
Aurevia Estate AI - Knowledge document model.
"""

from datetime import datetime

from sqlalchemy import DateTime, Enum, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import KnowledgeCategory, KnowledgeStatus


class KnowledgeDocument(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "knowledge_documents"
    __table_args__ = (
        Index("ix_knowledge_category_status", "category", "status"),
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    filename: Mapped[str | None] = mapped_column(String(255))
    category: Mapped[KnowledgeCategory] = mapped_column(Enum(KnowledgeCategory), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    source_type: Mapped[str | None] = mapped_column(String(100))
    file_type: Mapped[str | None] = mapped_column(String(20))
    file_size: Mapped[int | None] = mapped_column(Integer)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    qdrant_ids: Mapped[str | None] = mapped_column(Text)
    status: Mapped[KnowledgeStatus] = mapped_column(
        Enum(KnowledgeStatus), default=KnowledgeStatus.UPLOADED, nullable=False, index=True
    )
    last_indexed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    error_message: Mapped[str | None] = mapped_column(Text)

    def __repr__(self) -> str:
        return f"<KnowledgeDocument id={self.id} title={self.title}>"
