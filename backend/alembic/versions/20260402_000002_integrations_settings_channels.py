"""
Add integration state, app settings, and channel event types.
"""

from alembic import op
import sqlalchemy as sa


revision = "20260402_000002"
down_revision = "20260402_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()

    for value in [
        "whatsapp_webhook_received",
        "email_received",
        "integration_test_run",
        "settings_updated",
        "outbound_message_queued",
    ]:
        op.execute(f"ALTER TYPE eventtype ADD VALUE IF NOT EXISTS '{value}'")

    op.create_table(
        "integration_connections",
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("display_name", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("health", sa.String(length=30), nullable=False),
        sa.Column("config_metadata", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("last_checked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_integration_connections"),
    )
    op.create_index(
        "ix_integration_connections_provider",
        "integration_connections",
        ["provider"],
        unique=True,
    )
    op.create_index(
        "ix_integration_connections_status",
        "integration_connections",
        ["status"],
    )

    op.create_table(
        "app_settings",
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("payload", sa.Text(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_app_settings"),
    )
    op.create_index("ix_app_settings_category", "app_settings", ["category"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_app_settings_category", table_name="app_settings")
    op.drop_table("app_settings")

    op.drop_index("ix_integration_connections_status", table_name="integration_connections")
    op.drop_index("ix_integration_connections_provider", table_name="integration_connections")
    op.drop_table("integration_connections")
