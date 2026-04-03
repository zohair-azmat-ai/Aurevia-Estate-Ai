"""
Aurevia Estate AI - Application settings model.
"""

from sqlalchemy import Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


class AppSetting(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "app_settings"
    __table_args__ = (
        Index("ix_app_settings_category", "category", unique=True),
    )

    category: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)

    def __repr__(self) -> str:
        return f"<AppSetting category={self.category}>"
