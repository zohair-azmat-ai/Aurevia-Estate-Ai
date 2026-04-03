"""
Aurevia Estate AI - Shared database enums.
"""

from enum import Enum


class Channel(str, Enum):
    WEBSITE = "website"
    WHATSAPP = "whatsapp"
    EMAIL = "email"


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    ESCALATED = "escalated"
    CLOSED = "closed"
    LOST = "lost"


class IntentType(str, Enum):
    INQUIRY = "inquiry"
    VIEWING_REQUEST = "viewing_request"
    PRICING = "pricing"
    COMPLAINT = "complaint"
    FOLLOW_UP = "follow_up"
    OTHER = "other"


class PropertyType(str, Enum):
    APARTMENT = "apartment"
    VILLA = "villa"
    OFFICE = "office"
    WAREHOUSE = "warehouse"
    LAND = "land"
    TOWNHOUSE = "townhouse"


class TransactionType(str, Enum):
    BUY = "buy"
    RENT = "rent"


class ConversationStatus(str, Enum):
    OPEN = "open"
    ACTIVE = "active"
    RESOLVED = "resolved"
    ESCALATED = "escalated"
    CLOSED = "closed"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class FollowUpStatus(str, Enum):
    PENDING = "pending"
    EXECUTED = "executed"
    CANCELLED = "cancelled"
    FAILED = "failed"


class EscalationStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    REVIEW = "review"
    RESOLVED = "resolved"
    CLOSED = "closed"


class EscalationType(str, Enum):
    HIGH_BUDGET = "high_budget"
    REPEATED_QUERY = "repeated_query"
    NEGATIVE_SENTIMENT = "negative_sentiment"
    LOW_CONFIDENCE = "low_confidence"
    EXPLICIT_REQUEST = "explicit_request"


class EscalationPriority(str, Enum):
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class KnowledgeCategory(str, Enum):
    FAQ = "faq"
    AREA_GUIDE = "area_guide"
    BROCHURE = "brochure"
    PROPERTY_BROCHURE = "property_brochure"
    PRICING = "pricing"
    RENTAL_RULES = "rental_rules"
    POLICY = "policy"
    OTHER = "other"


class KnowledgeStatus(str, Enum):
    UPLOADED = "uploaded"
    PENDING = "pending"
    INDEXING = "indexing"
    INDEXED = "indexed"
    FAILED = "failed"
    ARCHIVED = "archived"


class EventType(str, Enum):
    LEAD_CREATED = "lead_created"
    MESSAGE_RECEIVED = "message_received"
    REPLY_GENERATED = "reply_generated"
    ESCALATION_TRIGGERED = "escalation_triggered"
    FOLLOWUP_SCHEDULED = "followup_scheduled"
    INTENT_DETECTED = "intent_detected"
    EXTRACTION_COMPLETED = "extraction_completed"
    RAG_RETRIEVED = "rag_retrieved"
    CRM_UPDATED = "crm_updated"
    KNOWLEDGE_INGESTED = "knowledge_ingested"
    KNOWLEDGE_UPLOADED = "knowledge_uploaded"
    KNOWLEDGE_INDEX_STARTED = "knowledge_index_started"
    KNOWLEDGE_INDEX_COMPLETED = "knowledge_index_completed"
    KNOWLEDGE_INDEX_FAILED = "knowledge_index_failed"
    KNOWLEDGE_REINDEXED = "knowledge_reindexed"
    KNOWLEDGE_DELETED = "knowledge_deleted"
    WHATSAPP_WEBHOOK_RECEIVED = "whatsapp_webhook_received"
    EMAIL_RECEIVED = "email_received"
    INTEGRATION_TEST_RUN = "integration_test_run"
    SETTINGS_UPDATED = "settings_updated"
    OUTBOUND_MESSAGE_QUEUED = "outbound_message_queued"
