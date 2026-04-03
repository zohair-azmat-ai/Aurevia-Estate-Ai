"""
Initial Aurevia schema.
"""

from alembic import op
import sqlalchemy as sa


revision = "20260402_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    channel_enum = sa.Enum("website", "whatsapp", "email", name="channel")
    lead_status_enum = sa.Enum("new", "contacted", "qualified", "escalated", "closed", "lost", name="leadstatus")
    intent_enum = sa.Enum("inquiry", "viewing_request", "pricing", "complaint", "follow_up", "other", name="intenttype")
    property_enum = sa.Enum("apartment", "villa", "office", "warehouse", "land", "townhouse", name="propertytype")
    transaction_enum = sa.Enum("buy", "rent", name="transactiontype")
    conversation_enum = sa.Enum("open", "active", "resolved", "escalated", "closed", name="conversationstatus")
    message_role_enum = sa.Enum("user", "assistant", "system", name="messagerole")
    followup_enum = sa.Enum("pending", "executed", "cancelled", "failed", name="followupstatus")
    escalation_status_enum = sa.Enum("pending", "assigned", "review", "resolved", "closed", name="escalationstatus")
    escalation_type_enum = sa.Enum("high_budget", "repeated_query", "negative_sentiment", "low_confidence", "explicit_request", name="escalationtype")
    escalation_priority_enum = sa.Enum("medium", "high", "critical", name="escalationpriority")
    knowledge_category_enum = sa.Enum("faq", "area_guide", "property_brochure", "pricing", "rental_rules", "policy", "other", name="knowledgecategory")
    knowledge_status_enum = sa.Enum("pending", "indexing", "indexed", "failed", name="knowledgestatus")
    event_enum = sa.Enum("lead_created", "message_received", "reply_generated", "escalation_triggered", "followup_scheduled", "intent_detected", "extraction_completed", "rag_retrieved", "crm_updated", "knowledge_ingested", name="eventtype")

    bind = op.get_bind()
    for enum in [
        channel_enum,
        lead_status_enum,
        intent_enum,
        property_enum,
        transaction_enum,
        conversation_enum,
        message_role_enum,
        followup_enum,
        escalation_status_enum,
        escalation_type_enum,
        escalation_priority_enum,
        knowledge_category_enum,
        knowledge_status_enum,
        event_enum,
    ]:
        enum.create(bind, checkfirst=True)

    op.create_table(
        "leads",
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=50), nullable=True),
        sa.Column("channel", channel_enum, nullable=False),
        sa.Column("intent", intent_enum, nullable=True),
        sa.Column("intent_confidence", sa.Float(), nullable=True),
        sa.Column("property_type", property_enum, nullable=True),
        sa.Column("transaction_type", transaction_enum, nullable=True),
        sa.Column("location_preference", sa.String(length=255), nullable=True),
        sa.Column("budget_min", sa.Integer(), nullable=True),
        sa.Column("budget_max", sa.Integer(), nullable=True),
        sa.Column("budget_currency", sa.String(length=10), nullable=False),
        sa.Column("bedrooms", sa.Integer(), nullable=True),
        sa.Column("status", lead_status_enum, nullable=False),
        sa.Column("is_escalated", sa.Boolean(), nullable=False),
        sa.Column("escalation_reason", sa.Text(), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("source_metadata", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_leads"),
    )
    op.create_index("ix_leads_email", "leads", ["email"])
    op.create_index("ix_leads_phone", "leads", ["phone"])
    op.create_index("ix_leads_channel", "leads", ["channel"])
    op.create_index("ix_leads_status", "leads", ["status"])
    op.create_index("ix_leads_budget_min", "leads", ["budget_min"])
    op.create_index("ix_leads_budget_max", "leads", ["budget_max"])
    op.create_index("ix_leads_location_preference", "leads", ["location_preference"])
    op.create_index("ix_leads_name_status", "leads", ["name", "status"])
    op.create_index("ix_leads_channel_created", "leads", ["channel", "created_at"])

    op.create_table(
        "knowledge_documents",
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("category", knowledge_category_enum, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source_type", sa.String(length=100), nullable=True),
        sa.Column("file_type", sa.String(length=20), nullable=True),
        sa.Column("chunk_count", sa.Integer(), nullable=False),
        sa.Column("qdrant_ids", sa.Text(), nullable=True),
        sa.Column("status", knowledge_status_enum, nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_knowledge_documents"),
    )
    op.create_index("ix_knowledge_documents_status", "knowledge_documents", ["status"])
    op.create_index("ix_knowledge_category_status", "knowledge_documents", ["category", "status"])

    op.create_table(
        "conversations",
        sa.Column("lead_id", sa.String(length=36), nullable=False),
        sa.Column("channel", channel_enum, nullable=False),
        sa.Column("status", conversation_enum, nullable=False),
        sa.Column("external_thread_id", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE", name="fk_conversations_lead_id_leads"),
        sa.PrimaryKeyConstraint("id", name="pk_conversations"),
    )
    op.create_index("ix_conversations_lead_id", "conversations", ["lead_id"])
    op.create_index("ix_conversations_channel", "conversations", ["channel"])
    op.create_index("ix_conversations_status", "conversations", ["status"])
    op.create_index("ix_conversations_external_thread_id", "conversations", ["external_thread_id"])
    op.create_index("ix_conversations_lead_channel", "conversations", ["lead_id", "channel"])

    op.create_table(
        "follow_ups",
        sa.Column("lead_id", sa.String(length=36), nullable=False),
        sa.Column("channel", channel_enum, nullable=False),
        sa.Column("message_template", sa.Text(), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("executed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", followup_enum, nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("next_action", sa.String(length=255), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE", name="fk_follow_ups_lead_id_leads"),
        sa.PrimaryKeyConstraint("id", name="pk_follow_ups"),
    )
    op.create_index("ix_follow_ups_lead_id", "follow_ups", ["lead_id"])
    op.create_index("ix_follow_ups_channel", "follow_ups", ["channel"])
    op.create_index("ix_follow_ups_status", "follow_ups", ["status"])
    op.create_index("ix_follow_ups_status_scheduled", "follow_ups", ["status", "scheduled_at"])

    op.create_table(
        "escalations",
        sa.Column("lead_id", sa.String(length=36), nullable=False),
        sa.Column("escalation_type", escalation_type_enum, nullable=False),
        sa.Column("priority", escalation_priority_enum, nullable=False),
        sa.Column("reason", sa.String(length=255), nullable=False),
        sa.Column("trigger_confidence", sa.Float(), nullable=True),
        sa.Column("trigger_message", sa.Text(), nullable=True),
        sa.Column("assigned_agent", sa.String(length=255), nullable=True),
        sa.Column("assigned_team", sa.String(length=255), nullable=True),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("resolution_notes", sa.Text(), nullable=True),
        sa.Column("status", escalation_status_enum, nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="CASCADE", name="fk_escalations_lead_id_leads"),
        sa.PrimaryKeyConstraint("id", name="pk_escalations"),
    )
    op.create_index("ix_escalations_lead_id", "escalations", ["lead_id"])
    op.create_index("ix_escalations_priority", "escalations", ["priority"])
    op.create_index("ix_escalations_status", "escalations", ["status"])
    op.create_index("ix_escalations_status_priority", "escalations", ["status", "priority"])

    op.create_table(
        "events",
        sa.Column("lead_id", sa.String(length=36), nullable=True),
        sa.Column("event_type", event_enum, nullable=False),
        sa.Column("channel", channel_enum, nullable=True),
        sa.Column("payload", sa.Text(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["lead_id"], ["leads.id"], ondelete="SET NULL", name="fk_events_lead_id_leads"),
        sa.PrimaryKeyConstraint("id", name="pk_events"),
    )
    op.create_index("ix_events_lead_id", "events", ["lead_id"])
    op.create_index("ix_events_event_type", "events", ["event_type"])
    op.create_index("ix_events_event_type_created", "events", ["event_type", "created_at"])

    op.create_table(
        "messages",
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("role", message_role_enum, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("channel", channel_enum, nullable=False),
        sa.Column("is_ai_generated", sa.Boolean(), nullable=False),
        sa.Column("ai_model", sa.String(length=100), nullable=True),
        sa.Column("tokens_used", sa.Integer(), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["conversation_id"], ["conversations.id"], ondelete="CASCADE", name="fk_messages_conversation_id_conversations"),
        sa.PrimaryKeyConstraint("id", name="pk_messages"),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])
    op.create_index("ix_messages_role", "messages", ["role"])
    op.create_index("ix_messages_channel", "messages", ["channel"])
    op.create_index("ix_messages_conversation_created", "messages", ["conversation_id", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_messages_conversation_created", table_name="messages")
    op.drop_index("ix_messages_channel", table_name="messages")
    op.drop_index("ix_messages_role", table_name="messages")
    op.drop_index("ix_messages_conversation_id", table_name="messages")
    op.drop_table("messages")

    op.drop_index("ix_events_event_type_created", table_name="events")
    op.drop_index("ix_events_event_type", table_name="events")
    op.drop_index("ix_events_lead_id", table_name="events")
    op.drop_table("events")

    op.drop_index("ix_escalations_status_priority", table_name="escalations")
    op.drop_index("ix_escalations_status", table_name="escalations")
    op.drop_index("ix_escalations_priority", table_name="escalations")
    op.drop_index("ix_escalations_lead_id", table_name="escalations")
    op.drop_table("escalations")

    op.drop_index("ix_follow_ups_status_scheduled", table_name="follow_ups")
    op.drop_index("ix_follow_ups_status", table_name="follow_ups")
    op.drop_index("ix_follow_ups_channel", table_name="follow_ups")
    op.drop_index("ix_follow_ups_lead_id", table_name="follow_ups")
    op.drop_table("follow_ups")

    op.drop_index("ix_conversations_lead_channel", table_name="conversations")
    op.drop_index("ix_conversations_external_thread_id", table_name="conversations")
    op.drop_index("ix_conversations_status", table_name="conversations")
    op.drop_index("ix_conversations_channel", table_name="conversations")
    op.drop_index("ix_conversations_lead_id", table_name="conversations")
    op.drop_table("conversations")

    op.drop_index("ix_knowledge_category_status", table_name="knowledge_documents")
    op.drop_index("ix_knowledge_documents_status", table_name="knowledge_documents")
    op.drop_table("knowledge_documents")

    op.drop_index("ix_leads_channel_created", table_name="leads")
    op.drop_index("ix_leads_name_status", table_name="leads")
    op.drop_index("ix_leads_location_preference", table_name="leads")
    op.drop_index("ix_leads_budget_max", table_name="leads")
    op.drop_index("ix_leads_budget_min", table_name="leads")
    op.drop_index("ix_leads_status", table_name="leads")
    op.drop_index("ix_leads_channel", table_name="leads")
    op.drop_index("ix_leads_phone", table_name="leads")
    op.drop_index("ix_leads_email", table_name="leads")
    op.drop_table("leads")

    bind = op.get_bind()
    for enum_name in [
        "eventtype",
        "knowledgestatus",
        "knowledgecategory",
        "escalationpriority",
        "escalationtype",
        "escalationstatus",
        "followupstatus",
        "messagerole",
        "conversationstatus",
        "transactiontype",
        "propertytype",
        "intenttype",
        "leadstatus",
        "channel",
    ]:
        sa.Enum(name=enum_name).drop(bind, checkfirst=True)
