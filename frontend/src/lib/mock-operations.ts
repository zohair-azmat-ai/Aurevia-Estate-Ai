import type { Channel, FollowUpStatus } from "../lib/types";

export type AnalyticsKpi = {
  label: string;
  value: string;
  change: string;
  detail: string;
  tone: "brand" | "green" | "blue" | "amber";
};

export type SourcePerformance = {
  source: string;
  channel: Channel;
  leads: number;
  qualifiedRate: string;
  pipelineValue: string;
  width: string;
};

export type FunnelStage = {
  label: string;
  count: number;
  rate: string;
  width: string;
};

export type ChannelMetric = {
  channel: Channel;
  handled: string;
  responseTime: string;
  satisfaction: string;
};

export type TrendPoint = {
  label: string;
  value: number;
  width: string;
};

export type FollowUpQueueItem = {
  id: string;
  leadName: string;
  channel: Channel;
  status: FollowUpStatus | "overdue";
  scheduledAt: string;
  lastContact: string;
  nextAction: string;
  owner: string;
  priority: "routine" | "priority" | "critical";
  automationNote: string;
};

export const analyticsKpis: AnalyticsKpi[] = [
  {
    label: "Qualified pipeline",
    value: "AED 31.2M",
    change: "+14.8%",
    detail: "High-intent demand converted from active inbound traffic.",
    tone: "brand",
  },
  {
    label: "Median first reply",
    value: "27 sec",
    change: "-11%",
    detail: "Cross-channel response performance this week.",
    tone: "green",
  },
  {
    label: "Escalation rate",
    value: "6.4%",
    change: "-1.2%",
    detail: "Human handoff load remains healthy and controlled.",
    tone: "amber",
  },
  {
    label: "AI resolution",
    value: "93.1%",
    change: "+2.4%",
    detail: "Threads closed or advanced without manual intervention.",
    tone: "blue",
  },
];

export const leadSourcePerformance: SourcePerformance[] = [
  {
    source: "Luxury buyer landing page",
    channel: "website",
    leads: 48,
    qualifiedRate: "61%",
    pipelineValue: "AED 18.7M",
    width: "w-[92%]",
  },
  {
    source: "Direct WhatsApp sales line",
    channel: "whatsapp",
    leads: 34,
    qualifiedRate: "53%",
    pipelineValue: "AED 9.4M",
    width: "w-[74%]",
  },
  {
    source: "Inbound broker email desk",
    channel: "email",
    leads: 19,
    qualifiedRate: "39%",
    pipelineValue: "AED 3.1M",
    width: "w-[43%]",
  },
];

export const conversionFunnel: FunnelStage[] = [
  { label: "Inbound leads", count: 136, rate: "100%", width: "w-full" },
  { label: "Qualified by AI", count: 78, rate: "57%", width: "w-[72%]" },
  { label: "Viewing or shortlist sent", count: 36, rate: "26%", width: "w-[50%]" },
  { label: "Human agent engaged", count: 18, rate: "13%", width: "w-[34%]" },
  { label: "Active negotiations", count: 9, rate: "7%", width: "w-[22%]" },
];

export const channelPerformance: ChannelMetric[] = [
  {
    channel: "website",
    handled: "64 active",
    responseTime: "19 sec",
    satisfaction: "91%",
  },
  {
    channel: "whatsapp",
    handled: "42 active",
    responseTime: "24 sec",
    satisfaction: "95%",
  },
  {
    channel: "email",
    handled: "21 active",
    responseTime: "4 min",
    satisfaction: "88%",
  },
];

export const responseTimeTrend: TrendPoint[] = [
  { label: "Mon", value: 41, width: "h-[46%]" },
  { label: "Tue", value: 36, width: "h-[56%]" },
  { label: "Wed", value: 29, width: "h-[68%]" },
  { label: "Thu", value: 24, width: "h-[80%]" },
  { label: "Fri", value: 27, width: "h-[74%]" },
  { label: "Sat", value: 22, width: "h-[88%]" },
  { label: "Sun", value: 25, width: "h-[78%]" },
];

export const aiVsHumanSplit = [
  { label: "AI handled", value: "93.1%", width: "w-[93%]", tone: "brand" },
  { label: "Human handled", value: "6.9%", width: "w-[18%]", tone: "blue" },
];

export const followUpQueue: FollowUpQueueItem[] = [
  {
    id: "fu-1",
    leadName: "Mariam Al Mansoori",
    channel: "website",
    status: "pending",
    scheduledAt: "2026-04-02T13:30:00.000Z",
    lastContact: "2026-04-02T09:20:00.000Z",
    nextAction: "Private callback + shortlist dispatch",
    owner: "Nadim Farouk",
    priority: "critical",
    automationNote: "AI prepared branded shortlist and is awaiting agent sign-off.",
  },
  {
    id: "fu-2",
    leadName: "Omar Rahman",
    channel: "whatsapp",
    status: "pending",
    scheduledAt: "2026-04-02T16:00:00.000Z",
    lastContact: "2026-04-02T10:40:00.000Z",
    nextAction: "Tower comparison and viewing invitation",
    owner: "Lina Merheb",
    priority: "priority",
    automationNote: "Comparison-led follow-up drafted with value and scarcity hooks.",
  },
  {
    id: "fu-3",
    leadName: "Claire Bennett",
    channel: "email",
    status: "pending",
    scheduledAt: "2026-04-03T08:30:00.000Z",
    lastContact: "2026-04-02T07:13:00.000Z",
    nextAction: "Relocation guide and family-focused shortlist",
    owner: "Unassigned",
    priority: "routine",
    automationNote: "Nurture-style educational sequence queued for morning delivery.",
  },
  {
    id: "fu-4",
    leadName: "Huda Al Falasi",
    channel: "whatsapp",
    status: "overdue",
    scheduledAt: "2026-04-02T11:20:00.000Z",
    lastContact: "2026-04-02T10:55:00.000Z",
    nextAction: "Immediate commercial desk callback",
    owner: "Commercial Desk",
    priority: "critical",
    automationNote: "Escalated thread is waiting on human recovery outreach.",
  },
  {
    id: "fu-5",
    leadName: "Sanjay Patel",
    channel: "website",
    status: "cancelled",
    scheduledAt: "2026-04-02T15:45:00.000Z",
    lastContact: "2026-04-02T06:04:00.000Z",
    nextAction: "Refresh shortlist after inventory sync",
    owner: "Rhea D'Souza",
    priority: "routine",
    automationNote: "Original automation paused while higher-quality inventory is refreshed.",
  },
];

export const followUpHealthCards = [
  {
    label: "Queued automations",
    value: "18",
    detail: "Live follow-ups ready for execution across all channels.",
  },
  {
    label: "Overdue actions",
    value: "01",
    detail: "Critical human callback requiring immediate attention.",
  },
  {
    label: "Automation health",
    value: "96%",
    detail: "Delivery logic and scheduling engine operating normally.",
  },
];
