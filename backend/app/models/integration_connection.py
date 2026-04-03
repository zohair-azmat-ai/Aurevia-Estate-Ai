"""
Aurevia Estate AI - Integration connection model.
"""

from datetime import datetime

from sqlalchemy import DateTime, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class IntegrationConnection(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "integration_connections"
    __table_args__ = (
        Index("ix_integration_connections_provider", "provider", unique=True),
        Index("ix_integration_connections_status", "status"),
    )

    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="offline")
    health: Mapped[str] = mapped_column(String(30), nullable=False, default="degraded")
    config_metadata: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    last_checked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    def __repr__(self) -> str:
        return f"<IntegrationConnection provider={self.provider} status={self.status}>"
