/**
 * Aurevia Estate AI - Shared frontend types.
 */

export type Channel = "website" | "whatsapp" | "email" | "phone";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "escalated"
  | "viewing"
  | "negotiation"
  | "closed"
  | "closed_won"
  | "lost"
  | "closed_lost";

export type Intent =
  | "buy"
  | "rent"
  | "inquiry"
  | "viewing_request"
  | "pricing"
  | "complaint"
  | "follow_up"
  | "other";

export type PropertyType =
  | "apartment"
  | "villa"
  | "office"
  | "warehouse"
  | "land"
  | "townhouse";

export type TransactionType = "buy" | "rent";
export type MessageRole = "user" | "assistant" | "system";
export type FollowUpStatus = "pending" | "executed" | "cancelled" | "failed" | "overdue";
export type EscalationStatus = "pending" | "assigned" | "review" | "resolved" | "closed";
export type EscalationPriority = "medium" | "high" | "critical";
export type EscalationType =
  | "high_budget"
  | "repeated_query"
  | "negative_sentiment"
  | "low_confidence"
  | "explicit_request";
export type KnowledgeCategory =
  | "faq"
  | "area_guide"
  | "brochure"
  | "property_brochure"
  | "pricing"
  | "rental_rules"
  | "policy"
  | "other";
export type KnowledgeStatus =
  | "uploaded"
  | "pending"
  | "indexing"
  | "indexed"
  | "failed"
  | "archived";
export type EventType =
  | "lead_created"
  | "message_received"
  | "reply_generated"
  | "escalation_triggered"
  | "followup_scheduled"
  | "intent_detected"
  | "extraction_completed"
  | "rag_retrieved"
  | "crm_updated"
  | "knowledge_ingested"
  | "knowledge_uploaded"
  | "knowledge_index_started"
  | "knowledge_index_completed"
  | "knowledge_index_failed"
  | "knowledge_reindexed"
  | "knowledge_deleted";

export interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  channel: Channel;
  intent: Intent | null;
  intent_confidence: number | null;
  property_type: PropertyType | null;
  transaction_type: TransactionType | null;
  location_preference: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  bedrooms: number | null;
  status: LeadStatus;
  is_escalated: boolean;
  escalation_reason: string | null;
  ai_summary?: string | null;
  source_metadata?: string | null;
  assigned_agent_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  channel: Channel;
  status: string;
  external_thread_id: string | null;
  summary?: string | null;
  subject?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  channel: Channel;
  is_ai_generated: boolean;
  ai_model: string | null;
  tokens_used: number | null;
  created_at: string;
  updated_at?: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  conversation_id?: string | null;
  channel: Channel;
  message_template: string;
  scheduled_at: string;
  scheduled_for?: string;
  executed_at: string | null;
  status: FollowUpStatus;
  attempt_count: number;
  error_message: string | null;
  next_action: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Escalation {
  id: string;
  lead_id: string;
  conversation_id?: string | null;
  escalation_type: EscalationType;
  priority: EscalationPriority;
  reason: string;
  trigger_confidence: number | null;
  trigger_message: string | null;
  assigned_agent: string | null;
  assigned_team: string | null;
  assigned_to?: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  status: EscalationStatus;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  filename: string | null;
  category: KnowledgeCategory;
  content: string;
  source_type: string | null;
  file_type: string | null;
  file_size: number | null;
  chunk_count: number;
  qdrant_ids: string | null;
  status: KnowledgeStatus;
  last_indexed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeActionResult {
  document_id: string;
  action: string;
  status: KnowledgeStatus;
  message: string;
  chunk_count: number;
  last_indexed_at: string | null;
  error_message: string | null;
}

export interface AnalyticsEvent {
  id: string;
  lead_id: string | null;
  event_type: EventType;
  channel: Channel | null;
  payload: Record<string, unknown> | string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface ChannelCount {
  channel: Channel;
  count: number;
}

export interface AnalyticsSummary {
  total_leads?: number;
  new_leads_7d?: number;
  conversations_today?: number;
  avg_response_time_seconds?: number;
  escalation_rate?: number;
  top_channels?: ChannelCount[];
  total_events?: number;
  channel_breakdown?: Record<string, number>;
}

export interface LeadIntakePayload {
  channel: Channel;
  content: string;
  name?: string;
  email?: string;
  phone?: string;
  external_thread_id?: string;
}

export interface IntakeResponse {
  status: string;
  lead_id: string;
  conversation_id: string;
  reply?: string;
  ai_reply?: string;
  intent: Intent;
  intent_confidence: number;
  structured_data: Record<string, unknown>;
  rag_results: Array<Record<string, unknown>>;
  escalation_id: string | null;
  follow_up_id: string;
}

export interface ApiErrorShape {
  message: string;
  status?: number;
}

export interface ChatRequest {
  message: string;
  user_id?: string;
}

export interface PropertySuggestion {
  id: string;
  title: string;
  location: string;
  property_type: string;
  transaction_type: string;
  price_aed: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  summary: string;
  match_reason: string;
}

export interface MarketInsight {
  location: string;
  average_rent_aed: number | null;
  average_sale_price_aed: number | null;
  trend: string;
  insight: string;
}

export interface ExtractedCriteria {
  intent: string | null;
  property_type: string | null;
  location: string | null;
  budget: number | null;
  bedrooms: number | null;
  high_priority: boolean;
}

export interface ChatResponse {
  reply: string;
  suggestions: PropertySuggestion[];
  extracted: ExtractedCriteria;
  market_insight: MarketInsight | null;
  lead_id: string | null;
  lead_created: boolean;
  high_priority: boolean;
}

export interface IntegrationProvider {
  provider: string;
  display_name: string;
  status: "connected" | "warning" | "offline";
  health: "healthy" | "degraded" | "unknown" | string;
  notes: string | null;
  config_metadata: Record<string, unknown>;
  last_checked_at: string | null;
  last_synced_at: string | null;
}

export interface IntegrationActionResult {
  provider: string;
  action: string;
  status: string;
  message: string;
  details: Record<string, unknown>;
  last_checked_at: string | null;
  last_synced_at: string | null;
}

export interface IntegrationTestSendPayload {
  to: string;
  message: string;
  subject?: string;
}

export interface WorkspaceSettings {
  workspace_name: string;
  primary_market: string;
  timezone: string;
  brand_tone: string;
}

export interface AISettings {
  primary_model: string;
  embedding_model: string;
  confidence_threshold: number;
  temperature: number;
  max_tokens: number;
}

export interface AutomationSettings {
  auto_follow_ups: boolean;
  escalation_guardrails: string;
  follow_up_delay_hours: number;
  enable_whatsapp: boolean;
  enable_email: boolean;
}

export interface NotificationSettings {
  priority_alerts: boolean;
  daily_summary_time: string;
  digest_email: string;
}

export interface SecuritySettings {
  admin_access_policy: string;
  audit_logging: boolean;
  session_timeout_minutes: number;
  mfa_required: boolean;
}

export interface AppSettings {
  workspace: WorkspaceSettings;
  ai: AISettings;
  automation: AutomationSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  updated_at: string | null;
}

export interface SettingsCategoryResponse {
  category: string;
  payload: Record<string, unknown>;
  updated_at: string | null;
}
