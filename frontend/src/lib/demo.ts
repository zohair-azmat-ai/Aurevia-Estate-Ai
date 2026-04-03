import { conversationRecords } from "../lib/mock-conversations";
import { leadRecords } from "../lib/mock-leads";
import { followUpQueue } from "../lib/mock-operations";
import { escalationQueue, integrations as mockIntegrations, knowledgeItems } from "../lib/mock-admin";
import type {
  AnalyticsEvent,
  AnalyticsSummary,
  AppSettings,
  ChatRequest,
  ChatResponse,
  Conversation,
  Escalation,
  FollowUp,
  IntegrationActionResult,
  IntegrationProvider,
  IntakeResponse,
  KnowledgeActionResult,
  KnowledgeDocument,
  Lead,
  LeadIntakePayload,
  Message,
  PaginatedResponse,
} from "../lib/types";

export type DemoModeSetting = "off" | "fallback" | "force";

const demoMode = (process.env.NEXT_PUBLIC_DEMO_MODE?.toLowerCase() as DemoModeSetting | undefined) ?? "fallback";

export function getDemoModeSetting(): DemoModeSetting {
  return demoMode;
}

export function isDemoFallbackEnabled() {
  return demoMode !== "off";
}

export function isDemoForced() {
  return demoMode === "force";
}

export function getRuntimeModeLabel() {
  if (demoMode === "force") {
    return {
      label: "Demo mode",
      description: "Mock data is intentionally powering the product for presentations and portfolio demos.",
    };
  }

  if (demoMode === "fallback") {
    return {
      label: "Smart fallback",
      description: "Live APIs are preferred, and the UI falls back to demo data if the backend is unreachable.",
    };
  }

  return {
    label: "Live mode",
    description: "The dashboard is reading from the connected backend without demo fallback.",
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function paginate<T>(items: T[], params?: { skip?: number; limit?: number }): PaginatedResponse<T> {
  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? items.length;
  return {
    items: items.slice(skip, skip + limit),
    total: items.length,
  };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function minutesAgo(value: number) {
  return new Date(Date.now() - value * 60_000).toISOString();
}

function extractChatCriteria(message: string) {
  const text = message.toLowerCase();
  const budgetMillion = text.match(/(\d+(?:\.\d+)?)\s*m\b/);
  const budgetK = text.match(/(\d+(?:\.\d+)?)\s*k\b/);
  const rawBudget = text.match(/\b(\d{5,8})\b/);
  const location =
    text.includes("dubai marina")
      ? "Dubai Marina"
      : text.includes("jvc")
        ? "JVC"
        : text.includes("palm jumeirah")
          ? "Palm Jumeirah"
          : text.includes("downtown")
            ? "Downtown Dubai"
            : null;
  const propertyType = text.includes("studio")
    ? "studio"
    : text.includes("1 bhk") || text.includes("1bhk")
      ? "1bhk"
      : text.includes("2 bhk") || text.includes("2bhk")
        ? "2bhk"
        : text.includes("villa")
          ? "villa"
          : text.includes("townhouse")
            ? "townhouse"
            : text.includes("apartment")
              ? "apartment"
              : null;
  const intent = text.includes("buy") || text.includes("purchase") || text.includes("invest")
    ? "buy"
    : text.includes("rent") || text.includes("lease")
      ? "rent"
      : null;
  const budget = budgetMillion
    ? Math.round(Number(budgetMillion[1]) * 1_000_000)
    : budgetK
      ? Math.round(Number(budgetK[1]) * 1_000)
      : rawBudget
        ? Number(rawBudget[1])
        : null;
  const bedrooms = propertyType === "studio" ? 0 : propertyType === "1bhk" ? 1 : propertyType === "2bhk" ? 2 : null;
  const highPriority = Boolean((budget && budget > 1_000_000) || intent === "buy");

  return {
    intent,
    property_type: propertyType,
    location,
    budget,
    bedrooms,
    high_priority: highPriority,
  };
}

let leadStore: Lead[] = leadRecords.map((record) => ({
  ...clone(record.lead),
  ai_summary: record.aiSummary,
  assigned_agent_name: record.assignedAgent,
}));

let conversationStore: Conversation[] = conversationRecords.map((record) => ({
  ...clone(record.conversation),
  summary: record.summary,
}));

let messageStore: Record<string, Message[]> = Object.fromEntries(
  conversationRecords.map((record) => [record.conversation.id, clone(record.messages)]),
);

let followUpStore: FollowUp[] = followUpQueue.map((item, index) => {
  const lead = leadStore.find((candidate) => candidate.name === item.leadName);
  const conversation = conversationStore.find((candidate) => candidate.lead_id === lead?.id);

  return {
    id: item.id,
    lead_id: lead?.id ?? `demo-lead-${index + 1}`,
    conversation_id: conversation?.id ?? null,
    channel: item.channel,
    message_template: item.automationNote,
    scheduled_at: item.scheduledAt,
    scheduled_for: item.scheduledAt,
    executed_at: item.status === "executed" ? item.scheduledAt : null,
    status: item.status === "overdue" ? "pending" : item.status,
    attempt_count: item.status === "failed" ? 2 : 0,
    error_message: item.status === "failed" ? "Delivery retry exceeded demo threshold." : null,
    next_action: item.nextAction,
    notes: item.automationNote,
    created_at: item.lastContact,
    updated_at: item.scheduledAt,
  };
});

let escalationStore: Escalation[] = escalationQueue.map((item, index) => {
  const lead = leadStore.find((candidate) => candidate.name === item.leadName);
  const conversation = conversationStore.find((candidate) => candidate.lead_id === lead?.id);

  return {
    id: item.id,
    lead_id: lead?.id ?? `demo-lead-${index + 1}`,
    conversation_id: conversation?.id ?? null,
    escalation_type:
      item.severity === "critical"
        ? "negative_sentiment"
        : item.severity === "high"
          ? "explicit_request"
          : "low_confidence",
    priority: item.severity,
    reason: item.reason,
    trigger_confidence: item.severity === "critical" ? 0.94 : item.severity === "high" ? 0.86 : 0.71,
    trigger_message: conversation ? messageStore[conversation.id]?.at(-1)?.content ?? null : null,
    assigned_agent: item.assignedTo,
    assigned_team: item.assignedTo,
    assigned_to: item.assignedTo,
    resolved_at: item.status === "resolved" ? minutesAgo(45) : null,
    resolution_notes: item.status === "resolved" ? "Closed after agent callback and shortlist confirmation." : null,
    status: item.status,
    created_at: minutesAgo(20 + index * 7),
    updated_at: minutesAgo(8 + index * 4),
  };
});

let knowledgeStore: KnowledgeDocument[] = knowledgeItems.map((item, index) => ({
  id: item.id,
  title: item.title,
  filename: `${slugify(item.title)}.${item.fileType.toLowerCase()}`,
  category:
    item.category === "area guide"
      ? "area_guide"
      : item.category === "brochure"
        ? "property_brochure"
        : item.category,
  content: item.summary,
  source_type: item.sourceType,
  file_type: item.fileType.toLowerCase(),
  file_size: 125_000 + index * 28_000,
  chunk_count: item.chunks,
  qdrant_ids: item.status === "failed" ? null : `${item.id}-chunk-map`,
  status: item.status === "processing" ? "indexing" : item.status,
  last_indexed_at: item.status === "failed" ? null : item.lastUpdated,
  error_message:
    item.status === "failed"
      ? "Extraction metadata needs to be regenerated before re-indexing."
      : null,
  created_at: item.lastUpdated,
  updated_at: item.lastUpdated,
}));

let integrationStore: IntegrationProvider[] = mockIntegrations.map((item) => ({
  provider: item.name.toLowerCase(),
  display_name: item.name,
  status: item.status,
  health: item.status === "connected" ? "healthy" : item.status === "warning" ? "degraded" : "unknown",
  notes: item.detail,
  config_metadata: {
    environment: item.envLabel,
    last_sync: item.lastSync,
  },
  last_checked_at: item.status === "offline" ? null : minutesAgo(5),
  last_synced_at: item.status === "offline" ? null : minutesAgo(3),
}));

let settingsStore: AppSettings = {
  workspace: {
    workspace_name: "Aurevia Estate AI",
    primary_market: "Dubai, UAE",
    timezone: "Asia/Dubai",
    brand_tone: "Confident, discreet, premium, and concierge-like.",
  },
  ai: {
    primary_model: "gpt-4o",
    embedding_model: "text-embedding-3-small",
    confidence_threshold: 0.82,
    temperature: 0.3,
    max_tokens: 1024,
  },
  automation: {
    auto_follow_ups: true,
    escalation_guardrails: "Strict",
    follow_up_delay_hours: 24,
    enable_whatsapp: true,
    enable_email: true,
  },
  notifications: {
    priority_alerts: true,
    daily_summary_time: "07:30 GST",
    digest_email: "ops@aurevia.ai",
  },
  security: {
    admin_access_policy: "Role-based access",
    audit_logging: true,
    session_timeout_minutes: 60,
    mfa_required: true,
  },
  updated_at: minutesAgo(12),
};

let analyticsEventStore: AnalyticsEvent[] = [
  ...leadStore.flatMap((lead, index) => [
    {
      id: `event-lead-created-${lead.id}`,
      lead_id: lead.id,
      event_type: "lead_created" as const,
      channel: lead.channel,
      payload: { score: Math.round((lead.intent_confidence ?? 0.7) * 100) },
      created_at: minutesAgo(180 - index * 18),
      updated_at: minutesAgo(180 - index * 18),
    },
    {
      id: `event-message-received-${lead.id}`,
      lead_id: lead.id,
      event_type: "message_received" as const,
      channel: lead.channel,
      payload: { response_seconds: 31 - Math.min(index * 2, 12) },
      created_at: minutesAgo(160 - index * 15),
      updated_at: minutesAgo(160 - index * 15),
    },
    {
      id: `event-reply-generated-${lead.id}`,
      lead_id: lead.id,
      event_type: "reply_generated" as const,
      channel: lead.channel,
      payload: { model: "gpt-4o", response_seconds: 24 - Math.min(index, 8) },
      created_at: minutesAgo(145 - index * 13),
      updated_at: minutesAgo(145 - index * 13),
    },
  ]),
  ...followUpStore.map((item, index) => ({
    id: `event-followup-${item.id}`,
    lead_id: item.lead_id,
    event_type: "followup_scheduled" as const,
    channel: item.channel,
    payload: { next_action: item.next_action },
    created_at: minutesAgo(120 - index * 8),
    updated_at: minutesAgo(120 - index * 8),
  })),
  ...escalationStore.map((item, index) => ({
    id: `event-escalation-${item.id}`,
    lead_id: item.lead_id,
    event_type: "escalation_triggered" as const,
    channel: leadStore.find((lead) => lead.id === item.lead_id)?.channel ?? null,
    payload: { priority: item.priority, reason: item.reason },
    created_at: minutesAgo(95 - index * 9),
    updated_at: minutesAgo(95 - index * 9),
  })),
  ...knowledgeStore.map((item, index) => ({
    id: `event-knowledge-${item.id}`,
    lead_id: null,
    event_type: "knowledge_ingested" as const,
    channel: null,
    payload: { status: item.status, chunks: item.chunk_count },
    created_at: minutesAgo(72 - index * 6),
    updated_at: minutesAgo(72 - index * 6),
  })),
];

function buildAnalyticsSummary(): AnalyticsSummary {
  const channelBreakdown = analyticsEventStore.reduce<Record<string, number>>((acc, event) => {
    if (event.channel) {
      acc[event.channel] = (acc[event.channel] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    total_leads: leadStore.length,
    new_leads_7d: leadStore.length,
    conversations_today: conversationStore.length,
    avg_response_time_seconds: 27,
    escalation_rate: escalationStore.length / Math.max(leadStore.length, 1),
    total_events: analyticsEventStore.length,
    channel_breakdown: channelBreakdown,
    top_channels: Object.entries(channelBreakdown)
      .map(([channel, count]) => ({ channel: channel as Lead["channel"], count }))
      .sort((a, b) => b.count - a.count),
  };
}

async function withLatency<T>(value: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  return clone(value);
}

export const demoApi = {
  leads: {
    list: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(leadStore, params)),
    get: async (id: string) => {
      const lead = leadStore.find((item) => item.id === id);
      if (!lead) throw new Error("Demo lead not found.");
      return withLatency(lead);
    },
    create: async (payload: Partial<Lead>) => {
      const created: Lead = {
        id: `lead-demo-${Date.now()}`,
        name: payload.name ?? "Demo lead",
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        channel: payload.channel ?? "website",
        intent: payload.intent ?? "inquiry",
        intent_confidence: payload.intent_confidence ?? 0.81,
        property_type: payload.property_type ?? "apartment",
        transaction_type: payload.transaction_type ?? "buy",
        location_preference: payload.location_preference ?? "Dubai Marina",
        budget_min: payload.budget_min ?? 2_500_000,
        budget_max: payload.budget_max ?? 3_800_000,
        budget_currency: payload.budget_currency ?? "AED",
        bedrooms: payload.bedrooms ?? 2,
        status: payload.status ?? "new",
        is_escalated: payload.is_escalated ?? false,
        escalation_reason: payload.escalation_reason ?? null,
        ai_summary: payload.ai_summary ?? "Demo lead created from the portfolio-mode intake form.",
        source_metadata: null,
        assigned_agent_name: payload.assigned_agent_name ?? "Aurevia AI",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      leadStore = [created, ...leadStore];
      return withLatency(created);
    },
    update: async (id: string, payload: Partial<Lead>) => {
      const index = leadStore.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Demo lead not found.");
      leadStore[index] = {
        ...leadStore[index],
        ...payload,
        updated_at: new Date().toISOString(),
      };
      return withLatency(leadStore[index]);
    },
    intake: async (payload: LeadIntakePayload) => {
      const lead = await demoApi.leads.create({
        name: payload.name ?? "New demo inquiry",
        email: payload.email ?? null,
        phone: payload.phone ?? null,
        channel: payload.channel,
        location_preference: "Dubai Harbour",
        property_type: "apartment",
        transaction_type: "buy",
        bedrooms: 3,
      });

      const conversationId = `conv-${lead.id}`;
      const now = new Date().toISOString();
      conversationStore = [
        {
          id: conversationId,
          lead_id: lead.id,
          channel: payload.channel,
          status: "open",
          external_thread_id: payload.external_thread_id ?? null,
          summary: "Demo intake conversation created for portfolio walkthroughs.",
          subject: `Demo inquiry from ${lead.name ?? "new lead"}`,
          created_at: now,
          updated_at: now,
        },
        ...conversationStore,
      ];
      messageStore[conversationId] = [
        {
          id: `msg-${Date.now()}-user`,
          conversation_id: conversationId,
          role: "user",
          content: payload.content,
          channel: payload.channel,
          is_ai_generated: false,
          ai_model: null,
          tokens_used: null,
          created_at: now,
          updated_at: now,
        },
        {
          id: `msg-${Date.now()}-assistant`,
          conversation_id: conversationId,
          role: "assistant",
          content:
            "Thanks for reaching out. Aurevia has captured your brief and prepared a premium next-step summary for the team.",
          channel: payload.channel,
          is_ai_generated: true,
          ai_model: "gpt-4o",
          tokens_used: 412,
          created_at: now,
          updated_at: now,
        },
      ];

      const response: IntakeResponse = {
        status: "success",
        lead_id: lead.id,
        conversation_id: conversationId,
        reply: "Demo intake captured successfully.",
        ai_reply:
          "Thanks for reaching out. I have captured your requirements and prepared the next best follow-up step for the sales desk.",
        intent: "inquiry",
        intent_confidence: 0.83,
        structured_data: {
          channel: payload.channel,
          captured: true,
        },
        rag_results: [],
        escalation_id: null,
        follow_up_id: `fu-demo-${Date.now()}`,
      };

      return withLatency(response);
    },
  },
  conversations: {
    list: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(conversationStore, params)),
    get: async (id: string) => {
      const conversation = conversationStore.find((item) => item.id === id);
      if (!conversation) throw new Error("Demo conversation not found.");
      return withLatency(conversation);
    },
    messages: async (conversationId: string, params?: { skip?: number; limit?: number }) =>
      withLatency(paginate(messageStore[conversationId] ?? [], params)),
  },
  followUps: {
    list: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(followUpStore, params)),
    execute: async (id: string) => {
      const index = followUpStore.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Demo follow-up not found.");
      followUpStore[index] = {
        ...followUpStore[index],
        status: "executed",
        executed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return withLatency(followUpStore[index]);
    },
  },
  escalations: {
    list: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(escalationStore, params)),
  },
  knowledge: {
    list: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(knowledgeStore, params)),
    get: async (id: string) => {
      const item = knowledgeStore.find((doc) => doc.id === id);
      if (!item) throw new Error("Demo document not found.");
      return withLatency(item);
    },
    upload: async (file: File, title: string, category: string) => {
      const now = new Date().toISOString();
      const item: KnowledgeDocument = {
        id: `kb-demo-${Date.now()}`,
        title,
        filename: file.name,
        category: category as KnowledgeDocument["category"],
        content: "Demo upload stored for product walkthroughs and recruiter-facing screenshots.",
        source_type: "Demo upload",
        file_type: file.name.split(".").pop() ?? "txt",
        file_size: file.size,
        chunk_count: 0,
        qdrant_ids: null,
        status: "uploaded",
        last_indexed_at: null,
        error_message: null,
        created_at: now,
        updated_at: now,
      };
      knowledgeStore = [item, ...knowledgeStore];
      return withLatency(item);
    },
    indexAction: async (id: string, action: "index" | "reindex" | "retry" | "delete") => {
      const index = knowledgeStore.findIndex((item) => item.id === id);
      if (index === -1) throw new Error("Demo document not found.");

      if (action === "delete") {
        const existing = knowledgeStore[index];
        knowledgeStore = knowledgeStore.filter((item) => item.id !== id);
        return withLatency<KnowledgeActionResult>({
          document_id: id,
          action,
          status: "archived",
          message: `${existing.title} was archived from the demo knowledge library.`,
          chunk_count: existing.chunk_count,
          last_indexed_at: existing.last_indexed_at,
          error_message: null,
        });
      }

      knowledgeStore[index] = {
        ...knowledgeStore[index],
        status: "indexed",
        chunk_count: Math.max(knowledgeStore[index].chunk_count, 42),
        last_indexed_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      };

      return withLatency<KnowledgeActionResult>({
        document_id: id,
        action,
        status: knowledgeStore[index].status,
        message:
          action === "index"
            ? "Document indexed successfully in demo mode."
            : action === "reindex"
              ? "Document re-indexed successfully in demo mode."
              : "Document retry completed successfully in demo mode.",
        chunk_count: knowledgeStore[index].chunk_count,
        last_indexed_at: knowledgeStore[index].last_indexed_at,
        error_message: null,
      });
    },
  },
  analytics: {
    summary: async () => withLatency(buildAnalyticsSummary()),
    events: async (params?: { skip?: number; limit?: number }) => withLatency(paginate(analyticsEventStore, params)),
  },
  integrations: {
    list: async () => withLatency(paginate(integrationStore)),
    get: async (provider: string) => {
      const item = integrationStore.find((entry) => entry.provider === provider);
      if (!item) throw new Error("Demo integration not found.");
      return withLatency(item);
    },
    action: async (provider: string, action: string) => {
      const item = integrationStore.find((entry) => entry.provider === provider);
      if (!item) throw new Error("Demo integration not found.");
      const updated = {
        ...item,
        last_checked_at: new Date().toISOString(),
        last_synced_at: action === "sync" ? new Date().toISOString() : item.last_synced_at,
      };
      integrationStore = integrationStore.map((entry) => (entry.provider === provider ? updated : entry));
      return withLatency<IntegrationActionResult>({
        provider,
        action,
        status: "success",
        message: `${item.display_name} ${action} completed successfully in demo mode.`,
        details: { source: "demo" },
        last_checked_at: updated.last_checked_at,
        last_synced_at: updated.last_synced_at,
      });
    },
    send: async (provider: "whatsapp" | "email") =>
      withLatency<IntegrationActionResult>({
        provider,
        action: "test-send",
        status: "success",
        message:
          provider === "whatsapp"
            ? "WhatsApp demo test message queued successfully."
            : "Email demo transport confirmed successfully.",
        details: { delivery: "simulated" },
        last_checked_at: new Date().toISOString(),
        last_synced_at: new Date().toISOString(),
      }),
  },
  settings: {
    get: async () => withLatency(settingsStore),
    update: async (payload: Partial<AppSettings>) => {
      settingsStore = {
        ...settingsStore,
        ...payload,
        workspace: { ...settingsStore.workspace, ...payload.workspace },
        ai: { ...settingsStore.ai, ...payload.ai },
        automation: { ...settingsStore.automation, ...payload.automation },
        notifications: { ...settingsStore.notifications, ...payload.notifications },
        security: { ...settingsStore.security, ...payload.security },
        updated_at: new Date().toISOString(),
      };
      return withLatency(settingsStore);
    },
  },
  health: {
    check: async () =>
      withLatency({
        status: "ok",
        service: "aurevia-demo-runtime",
        version: "demo-1.0",
      }),
  },
  chat: {
    send: async (payload: ChatRequest) => {
      const extracted = extractChatCriteria(payload.message);
      const suggestions = [
        {
          id: "demo-chat-1",
          title:
            extracted.location === "Palm Jumeirah"
              ? "Palm Jumeirah Signature Villa"
              : extracted.location === "JVC"
                ? "JVC One-Bedroom Lifestyle Apartment"
                : "Dubai Marina 1BR Executive Apartment",
          location: extracted.location ?? "Dubai Marina",
          property_type: extracted.property_type ?? "apartment",
          transaction_type: extracted.intent ?? "rent",
          price_aed:
            extracted.location === "Palm Jumeirah"
              ? 24_000_000
              : extracted.location === "JVC"
                ? 74_000
                : 92_000,
          bedrooms: extracted.bedrooms ?? 1,
          bathrooms: extracted.location === "Palm Jumeirah" ? 6 : 2,
          area_sqft: extracted.location === "Palm Jumeirah" ? 7200 : 812,
          summary: "Matched from Aurevia's premium demo inventory based on the brief.",
          match_reason: "Aligned with the stated brief and demo inventory filters.",
        },
      ];

      return withLatency<ChatResponse>({
        reply:
          "I've understood your brief and shortlisted a relevant option. If you'd like, I can now refine this into the strongest shortlist and prepare an agent handoff.",
        suggestions,
        extracted,
        market_insight: extracted.location
          ? {
              location: extracted.location,
              average_rent_aed: extracted.location === "Palm Jumeirah" ? 420000 : 88000,
              average_sale_price_aed: extracted.location === "Palm Jumeirah" ? 17500000 : 1850000,
              trend: extracted.location === "JVC" ? "Upward" : "Stable-to-up",
              insight: "Demo market insight: this area is performing well for premium buyer and tenant demand.",
            }
          : null,
        lead_id: extracted.budget && extracted.location && extracted.property_type ? `chat-demo-${Date.now()}` : null,
        lead_created: Boolean(extracted.budget && extracted.location && extracted.property_type),
        high_priority: extracted.high_priority,
      });
    },
  },
};
