import type { Channel } from "../lib/types";

export type EscalationSeverity = "critical" | "high" | "medium";
export type EscalationItem = {
  id: string;
  leadName: string;
  channel: Channel;
  severity: EscalationSeverity;
  assignedTo: string;
  waitingTime: string;
  sla: string;
  reason: string;
  status: "pending" | "assigned" | "review" | "resolved";
};

export type KnowledgeCategoryUi = "faq" | "brochure" | "area guide" | "policy";
export type KnowledgeItem = {
  id: string;
  title: string;
  category: KnowledgeCategoryUi;
  sourceType: string;
  fileType: string;
  chunks: number;
  lastUpdated: string;
  status: "indexed" | "processing" | "failed";
  summary: string;
};

export type IntegrationItem = {
  id: string;
  name: string;
  status: "connected" | "warning" | "offline";
  detail: string;
  envLabel: string;
  lastSync: string;
  accent: "brand" | "green" | "blue" | "amber";
};

export type SettingsSection = {
  id: string;
  title: string;
  description: string;
  fields: Array<{
    label: string;
    value: string;
    hint: string;
    kind: "text" | "select" | "toggle";
  }>;
};

export const escalationSummaryCards = [
  {
    label: "Open escalations",
    value: "07",
    detail: "Active handoffs currently needing review or assignment.",
  },
  {
    label: "Critical SLA risk",
    value: "02",
    detail: "Cases approaching response breach thresholds.",
  },
  {
    label: "Median response",
    value: "11 min",
    detail: "Average time from AI trigger to human ownership.",
  },
];

export const escalationQueue: EscalationItem[] = [
  {
    id: "esc-1",
    leadName: "Huda Al Falasi",
    channel: "whatsapp",
    severity: "critical",
    assignedTo: "Commercial Desk",
    waitingTime: "14 min",
    sla: "Breach in 6 min",
    reason: "Complaint escalated after delayed commercial callback and urgent office request.",
    status: "assigned",
  },
  {
    id: "esc-2",
    leadName: "Mariam Al Mansoori",
    channel: "website",
    severity: "high",
    assignedTo: "Nadim Farouk",
    waitingTime: "7 min",
    sla: "On track",
    reason: "Private high-value viewing request requires discreet human coordination.",
    status: "review",
  },
  {
    id: "esc-3",
    leadName: "Omar Rahman",
    channel: "whatsapp",
    severity: "medium",
    assignedTo: "Lina Merheb",
    waitingTime: "4 min",
    sla: "On track",
    reason: "Pricing comparison needs agent-led value framing to secure viewing intent.",
    status: "pending",
  },
];

export const knowledgeItems: KnowledgeItem[] = [
  {
    id: "kb-1",
    title: "Dubai Marina Buyer FAQ Pack",
    category: "faq",
    sourceType: "Internal FAQ library",
    fileType: "PDF",
    chunks: 84,
    lastUpdated: "2026-04-01T14:00:00.000Z",
    status: "indexed",
    summary: "Buyer objections, financing notes, and handoff-safe responses for Marina inquiries.",
  },
  {
    id: "kb-2",
    title: "Palm Jumeirah Signature Brochure Set",
    category: "brochure",
    sourceType: "Developer collateral",
    fileType: "PDF",
    chunks: 126,
    lastUpdated: "2026-04-02T09:30:00.000Z",
    status: "processing",
    summary: "Luxury listing brochures for branded residences and signature villas.",
  },
  {
    id: "kb-3",
    title: "Downtown Dubai Area Guide",
    category: "area guide",
    sourceType: "Market intelligence",
    fileType: "DOCX",
    chunks: 63,
    lastUpdated: "2026-03-31T18:20:00.000Z",
    status: "indexed",
    summary: "Neighborhood positioning, tower tiers, and lifestyle talking points.",
  },
  {
    id: "kb-4",
    title: "Escalation and Brand Policy Manual",
    category: "policy",
    sourceType: "Operations handbook",
    fileType: "PDF",
    chunks: 48,
    lastUpdated: "2026-04-01T11:10:00.000Z",
    status: "failed",
    summary: "Policy rules covering tone, compliance boundaries, and escalation triggers.",
  },
];

export const integrations: IntegrationItem[] = [
  {
    id: "int-1",
    name: "WhatsApp",
    status: "connected",
    detail: "Webhook and delivery callbacks healthy.",
    envLabel: "Meta Cloud API",
    lastSync: "2 min ago",
    accent: "green",
  },
  {
    id: "int-2",
    name: "Email",
    status: "connected",
    detail: "Inbound parsing and outbound reply sync stable.",
    envLabel: "IMAP / SMTP",
    lastSync: "4 min ago",
    accent: "blue",
  },
  {
    id: "int-3",
    name: "OpenAI",
    status: "connected",
    detail: "GPT-4o orchestration and embedding pipelines available.",
    envLabel: "API model layer",
    lastSync: "Live",
    accent: "brand",
  },
  {
    id: "int-4",
    name: "Qdrant",
    status: "warning",
    detail: "Vector health good, but latest ingestion queue is still processing.",
    envLabel: "Vector retrieval",
    lastSync: "9 min ago",
    accent: "amber",
  },
  {
    id: "int-5",
    name: "PostgreSQL",
    status: "connected",
    detail: "Lead, conversation, and events data persisting normally.",
    envLabel: "Primary database",
    lastSync: "Live",
    accent: "blue",
  },
  {
    id: "int-6",
    name: "CRM",
    status: "offline",
    detail: "Outbound sync is mocked for this phase and awaiting real connector wiring.",
    envLabel: "External CRM bridge",
    lastSync: "Not connected",
    accent: "amber",
  },
];

export const settingsSections: SettingsSection[] = [
  {
    id: "workspace",
    title: "Workspace settings",
    description: "Core workspace identity and operating defaults for the Aurevia console.",
    fields: [
      {
        label: "Workspace name",
        value: "Aurevia Estate AI",
        hint: "Shown across admin surfaces and exported briefs.",
        kind: "text",
      },
      {
        label: "Primary market",
        value: "Dubai, UAE",
        hint: "Used for formatting, timezone, and reporting assumptions.",
        kind: "select",
      },
    ],
  },
  {
    id: "ai",
    title: "AI model settings",
    description: "Controls for orchestration, retrieval, and reply generation behavior.",
    fields: [
      {
        label: "Primary model",
        value: "GPT-4o",
        hint: "Main orchestration and reply model.",
        kind: "select",
      },
      {
        label: "Confidence threshold",
        value: "0.82",
        hint: "Below this, escalation logic becomes more aggressive.",
        kind: "text",
      },
    ],
  },
  {
    id: "automation",
    title: "Automation settings",
    description: "Cadence and safety controls for follow-up sequences and task routing.",
    fields: [
      {
        label: "Auto follow-ups",
        value: "Enabled",
        hint: "Allow AI to schedule nurture sequences automatically.",
        kind: "toggle",
      },
      {
        label: "Escalation guardrails",
        value: "Strict",
        hint: "Prioritize human takeover on urgency, sentiment, or complaint signals.",
        kind: "select",
      },
    ],
  },
  {
    id: "notifications",
    title: "Notification preferences",
    description: "Control how the ops team is alerted for risk and priority events.",
    fields: [
      {
        label: "Priority alerts",
        value: "Enabled",
        hint: "Send alerts for critical escalations and SLA risk.",
        kind: "toggle",
      },
      {
        label: "Daily summary",
        value: "07:30 GST",
        hint: "Executive performance digest delivery time.",
        kind: "text",
      },
    ],
  },
  {
    id: "security",
    title: "Security and access",
    description: "Placeholder controls for authentication, permissions, and audit policies.",
    fields: [
      {
        label: "Admin access policy",
        value: "Role-based",
        hint: "Reserved for role and permission mapping in the next security pass.",
        kind: "select",
      },
      {
        label: "Audit logging",
        value: "Enabled",
        hint: "Track sensitive admin actions and system changes.",
        kind: "toggle",
      },
    ],
  },
];
