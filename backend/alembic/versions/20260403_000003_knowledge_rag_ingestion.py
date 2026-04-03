"""
Knowledge RAG ingestion upgrade — new columns and enum values.
"""

from alembic import op
import sqlalchemy as sa


revision = "20260403_000003"
down_revision = "20260402_000002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # Extend KnowledgeCategory enum                                        #
    # ------------------------------------------------------------------ #
    op.execute("ALTER TYPE knowledgecategory ADD VALUE IF NOT EXISTS 'brochure'")

    # ------------------------------------------------------------------ #
    # Extend KnowledgeStatus enum                                          #
    # ------------------------------------------------------------------ #
    op.execute("ALTER TYPE knowledgestatus ADD VALUE IF NOT EXISTS 'uploaded'")
    op.execute("ALTER TYPE knowledgestatus ADD VALUE IF NOT EXISTS 'archived'")

    # ------------------------------------------------------------------ #
    # Extend EventType enum                                                #
    # ------------------------------------------------------------------ #
    for value in [
        "knowledge_uploaded",
        "knowledge_index_started",
        "knowledge_index_completed",
        "knowledge_index_failed",
        "knowledge_reindexed",
        "knowledge_deleted",
    ]:
        op.execute(f"ALTER TYPE eventtype ADD VALUE IF NOT EXISTS '{value}'")

    # ------------------------------------------------------------------ #
    # Add new columns to knowledge_documents                               #
    # ------------------------------------------------------------------ #
    op.add_column(
        "knowledge_documents",
        sa.Column("filename", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "knowledge_documents",
        sa.Column("file_size", sa.Integer(), nullable=True),
    )
    op.add_column(
        "knowledge_documents",
        sa.Column("last_indexed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("knowledge_documents", "last_indexed_at")
    op.drop_column("knowledge_documents", "file_size")
    op.drop_column("knowledge_documents", "filename")
    # Note: Postgres does not support removing enum values.
    # Downgrade cannot reverse the ALTER TYPE ADD VALUE operations.
