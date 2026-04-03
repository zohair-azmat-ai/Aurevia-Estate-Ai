import type {
  Channel,
  FollowUpStatus,
  Intent,
  Lead,
  LeadStatus,
  PropertyType,
  TransactionType,
} from "../lib/types";

export type LeadScoreBand = "elite" | "high" | "medium" | "watch";

export type LeadRequirement = {
  label: string;
  value: string;
};

export type ConversationPreviewItem = {
  id: string;
  role: "lead" | "ai";
  channel: Channel;
  content: string;
  timestamp: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: "brand" | "green" | "blue" | "amber" | "red";
};

export type FollowUpPanel = {
  status: FollowUpStatus;
  nextTouchpoint: string;
  cadence: string;
  owner: string;
  recommendation: string;
};

export type PropertyMatch = {
  id: string;
  title: string;
  location: string;
  price: string;
  fit: string;
};

export type LeadRecord = {
  lead: Lead;
  assignedAgent: string | null;
  score: number;
  scoreBand: LeadScoreBand;
  sourceLabel: string;
  aiSummary: string;
  summarySnippet: string;
  requirements: LeadRequirement[];
  conversationPreview: ConversationPreviewItem[];
  timeline: TimelineEvent[];
  followUp: FollowUpPanel;
  crmInsights: string[];
  propertyMatches: PropertyMatch[];
};

function createLead(input: {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: Channel;
  intent: Intent;
  intentConfidence: number;
  propertyType: PropertyType;
  transactionType: TransactionType;
  locationPreference: string;
  budgetMin: number;
  budgetMax: number;
  bedrooms: number;
  status: LeadStatus;
  isEscalated: boolean;
  escalationReason?: string;
  updatedAt: string;
  createdAt: string;
}): Lead {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    channel: input.channel,
    intent: input.intent,
    intent_confidence: input.intentConfidence,
    property_type: input.propertyType,
    transaction_type: input.transactionType,
    location_preference: input.locationPreference,
    budget_min: input.budgetMin,
    budget_max: input.budgetMax,
    budget_currency: "AED",
    bedrooms: input.bedrooms,
    status: input.status,
    is_escalated: input.isEscalated,
    escalation_reason: input.escalationReason ?? null,
    created_at: input.createdAt,
    updated_at: input.updatedAt,
  };
}

export const leadRecords: LeadRecord[] = [
  {
    lead: createLead({
      id: "lead-palm-jumeirah-001",
      name: "Mariam Al Mansoori",
      email: "mariam@auraprivate.ae",
      phone: "+971 50 481 1140",
      channel: "website",
      intent: "viewing_request",
      intentConfidence: 0.97,
      propertyType: "villa",
      transactionType: "buy",
      locationPreference: "Palm Jumeirah",
      budgetMin: 16000000,
      budgetMax: 20000000,
      bedrooms: 5,
      status: "qualified",
      isEscalated: false,
      updatedAt: "2026-04-02T11:52:00.000Z",
      createdAt: "2026-04-02T09:15:00.000Z",
    }),
    assignedAgent: "Nadim Farouk",
    score: 96,
    scoreBand: "elite",
    sourceLabel: "Luxury buyer form",
    aiSummary:
      "Serious Palm Jumeirah buyer seeking a 5-bedroom branded or signature villa with immediate viewing availability. Budget clarity is strong, urgency is high, and the lead has requested a discreet callback window this afternoon.",
    summarySnippet:
      "High-net-worth buyer seeking a 5BR Palm Jumeirah villa with fast private viewing coordination.",
    requirements: [
      { label: "Transaction", value: "Buy" },
      { label: "Target location", value: "Palm Jumeirah" },
      { label: "Property type", value: "Villa / Branded residence" },
      { label: "Bedrooms", value: "5 bedrooms" },
      { label: "Budget band", value: "AED 16M - 20M" },
      { label: "Urgency", value: "Viewing requested within 24 hours" },
    ],
    conversationPreview: [
      {
        id: "cp-1",
        role: "lead",
        channel: "website",
        content:
          "I am looking for a signature villa on Palm Jumeirah, ideally furnished, and I can move quickly if the fit is right.",
        timestamp: "2026-04-02T09:17:00.000Z",
      },
      {
        id: "cp-2",
        role: "ai",
        channel: "website",
        content:
          "I can shortlist premium Palm Jumeirah villas that fit your budget and arrange a private viewing today. Would you prefer a branded residence or beachfront standalone villa?",
        timestamp: "2026-04-02T09:18:00.000Z",
      },
      {
        id: "cp-3",
        role: "lead",
        channel: "website",
        content:
          "A branded residence is preferred. Please keep it discreet and arrange a callback after 4 PM.",
        timestamp: "2026-04-02T09:19:00.000Z",
      },
    ],
    timeline: [
      {
        id: "tl-1",
        title: "Lead captured via website",
        description: "Intake form completed on the luxury inventory landing flow.",
        time: "2026-04-02T09:15:00.000Z",
        tone: "blue",
      },
      {
        id: "tl-2",
        title: "AI qualification complete",
        description: "Intent confidence exceeded 97% and budget fields were fully extracted.",
        time: "2026-04-02T09:19:00.000Z",
        tone: "brand",
      },
      {
        id: "tl-3",
        title: "Agent assignment suggested",
        description: "Luxury waterfront specialist Nadim Farouk attached to the record.",
        time: "2026-04-02T09:24:00.000Z",
        tone: "green",
      },
      {
        id: "tl-4",
        title: "Private viewing prep pending",
        description: "Awaiting confirmation of callback and shortlist package.",
        time: "2026-04-02T11:52:00.000Z",
        tone: "amber",
      },
    ],
    followUp: {
      status: "pending",
      nextTouchpoint: "2026-04-02T13:30:00.000Z",
      cadence: "Private callback + curated shortlist",
      owner: "Nadim Farouk",
      recommendation:
        "Send a discreet branded shortlist before the callback to preserve momentum and reinforce trust.",
    },
    crmInsights: [
      "Lead language indicates decisiveness and preference for privacy, which usually correlates with high close potential in premium inventory.",
      "Branded residence preference narrows options effectively and reduces qualification friction for the assigned agent.",
      "Best next action is an agent-led call paired with a tightly curated shortlist rather than a broad brochure dump.",
    ],
    propertyMatches: [
      {
        id: "pm-1",
        title: "Signature Beachfront Villa",
        location: "Palm Jumeirah",
        price: "AED 18.5M",
        fit: "94% match",
      },
      {
        id: "pm-2",
        title: "Branded Waterfront Residence",
        location: "Palm Jumeirah",
        price: "AED 17.9M",
        fit: "91% match",
      },
    ],
  },
  {
    lead: createLead({
      id: "lead-downtown-002",
      name: "Omar Rahman",
      email: "omar@vertexholdings.com",
      phone: "+971 52 721 0088",
      channel: "whatsapp",
      intent: "pricing",
      intentConfidence: 0.91,
      propertyType: "apartment",
      transactionType: "buy",
      locationPreference: "Downtown Dubai",
      budgetMin: 4200000,
      budgetMax: 6000000,
      bedrooms: 3,
      status: "contacted",
      isEscalated: false,
      updatedAt: "2026-04-02T10:40:00.000Z",
      createdAt: "2026-04-02T08:10:00.000Z",
    }),
    assignedAgent: "Lina Merheb",
    score: 84,
    scoreBand: "high",
    sourceLabel: "WhatsApp direct inquiry",
    aiSummary:
      "Buyer is evaluating premium 3-bedroom apartments in Downtown Dubai and is currently price-shopping across a narrow set of towers. Engagement is active, but the lead still needs stronger urgency before a viewing is secured.",
    summarySnippet:
      "Warm WhatsApp buyer comparing Downtown 3BR options with a defined mid-premium budget.",
    requirements: [
      { label: "Transaction", value: "Buy" },
      { label: "Target location", value: "Downtown Dubai" },
      { label: "Property type", value: "Apartment" },
      { label: "Bedrooms", value: "3 bedrooms" },
      { label: "Budget band", value: "AED 4.2M - 6M" },
      { label: "Priority", value: "Price clarity and tower comparison" },
    ],
    conversationPreview: [
      {
        id: "cp-4",
        role: "lead",
        channel: "whatsapp",
        content:
          "Can you share the current price range for premium three-bedroom apartments in Downtown, especially branded towers?",
        timestamp: "2026-04-02T08:11:00.000Z",
      },
      {
        id: "cp-5",
        role: "ai",
        channel: "whatsapp",
        content:
          "Absolutely. Premium three-bedroom residences in Downtown are currently clustering between AED 4.5M and AED 6M depending on tower, view, and furnishing. I can also compare specific towers for you.",
        timestamp: "2026-04-02T08:12:00.000Z",
      },
    ],
    timeline: [
      {
        id: "tl-5",
        title: "WhatsApp inquiry received",
        description: "Lead initiated a direct pricing conversation through the sales number.",
        time: "2026-04-02T08:10:00.000Z",
        tone: "green",
      },
      {
        id: "tl-6",
        title: "Tower comparison offered",
        description: "AI proposed a narrowed shortlist based on budget and branded preference.",
        time: "2026-04-02T08:12:00.000Z",
        tone: "blue",
      },
      {
        id: "tl-7",
        title: "Agent nudged to follow up",
        description: "Suggested human follow-up to convert pricing interest into a viewing request.",
        time: "2026-04-02T10:40:00.000Z",
        tone: "amber",
      },
    ],
    followUp: {
      status: "pending",
      nextTouchpoint: "2026-04-02T16:00:00.000Z",
      cadence: "Tower comparison + viewing invitation",
      owner: "Lina Merheb",
      recommendation:
        "Use comparison-led outreach and introduce scarcity around units with best Burj views to create urgency.",
    },
    crmInsights: [
      "Lead is still in research mode, so the strongest conversion lever is curated comparison rather than generic brochure sending.",
      "Branded tower preference suggests a premium lifestyle angle will outperform pure price-led messaging.",
    ],
    propertyMatches: [
      {
        id: "pm-3",
        title: "Opera District Sky Residence",
        location: "Downtown Dubai",
        price: "AED 5.4M",
        fit: "89% match",
      },
    ],
  },
  {
    lead: createLead({
      id: "lead-dubai-hills-003",
      name: "Claire Bennett",
      email: "claire.bennett@northanchor.co.uk",
      phone: "+44 78 2244 1109",
      channel: "email",
      intent: "inquiry",
      intentConfidence: 0.87,
      propertyType: "townhouse",
      transactionType: "buy",
      locationPreference: "Dubai Hills Estate",
      budgetMin: 3200000,
      budgetMax: 4200000,
      bedrooms: 4,
      status: "new",
      isEscalated: false,
      updatedAt: "2026-04-02T07:58:00.000Z",
      createdAt: "2026-04-02T07:10:00.000Z",
    }),
    assignedAgent: null,
    score: 76,
    scoreBand: "medium",
    sourceLabel: "Inbound email",
    aiSummary:
      "International buyer is exploring Dubai Hills townhouses and appears early in the discovery process. Good budget alignment and family-use intent, but timing and decision process still need clarification.",
    summarySnippet:
      "Early-stage overseas buyer exploring 4BR family townhouses in Dubai Hills Estate.",
    requirements: [
      { label: "Transaction", value: "Buy" },
      { label: "Target location", value: "Dubai Hills Estate" },
      { label: "Property type", value: "Townhouse" },
      { label: "Bedrooms", value: "4 bedrooms" },
      { label: "Budget band", value: "AED 3.2M - 4.2M" },
      { label: "Intent signal", value: "Family relocation research" },
    ],
    conversationPreview: [
      {
        id: "cp-6",
        role: "lead",
        channel: "email",
        content:
          "We are considering a move to Dubai later this year and would like to understand townhouse options in Dubai Hills for a family of four.",
        timestamp: "2026-04-02T07:11:00.000Z",
      },
      {
        id: "cp-7",
        role: "ai",
        channel: "email",
        content:
          "Dubai Hills Estate is a strong fit for family buyers. I can outline four-bedroom townhouse options, community features, and a current budget snapshot to help you compare.",
        timestamp: "2026-04-02T07:13:00.000Z",
      },
    ],
    timeline: [
      {
        id: "tl-8",
        title: "Email captured",
        description: "Long-form inquiry detected and structured into CRM fields.",
        time: "2026-04-02T07:10:00.000Z",
        tone: "blue",
      },
      {
        id: "tl-9",
        title: "Discovery response sent",
        description: "AI returned a helpful family-focused introduction and asked qualification questions.",
        time: "2026-04-02T07:13:00.000Z",
        tone: "green",
      },
    ],
    followUp: {
      status: "pending",
      nextTouchpoint: "2026-04-03T08:30:00.000Z",
      cadence: "Relocation guide + community shortlist",
      owner: "Unassigned",
      recommendation:
        "Pair family-focused community guidance with a shortlist to move the lead from research into concrete options.",
    },
    crmInsights: [
      "Lead quality is solid, but qualification depth is still limited and there is no active urgency marker.",
      "An educational follow-up will likely outperform a hard sales push at this stage.",
    ],
    propertyMatches: [
      {
        id: "pm-4",
        title: "Parkside Family Townhouse",
        location: "Dubai Hills Estate",
        price: "AED 3.85M",
        fit: "86% match",
      },
    ],
  },
  {
    lead: createLead({
      id: "lead-jvc-004",
      name: "Sanjay Patel",
      email: "sanjay@creststone.io",
      phone: "+971 58 019 7411",
      channel: "website",
      intent: "follow_up",
      intentConfidence: 0.82,
      propertyType: "apartment",
      transactionType: "rent",
      locationPreference: "Jumeirah Village Circle",
      budgetMin: 135000,
      budgetMax: 165000,
      bedrooms: 2,
      status: "contacted",
      isEscalated: false,
      updatedAt: "2026-04-02T06:24:00.000Z",
      createdAt: "2026-04-01T17:40:00.000Z",
    }),
    assignedAgent: "Rhea D'Souza",
    score: 69,
    scoreBand: "medium",
    sourceLabel: "Retargeting form",
    aiSummary:
      "Returning renter with clear budget and area preference. Engagement has softened slightly since initial contact, so the priority is a fast, relevant reactivation touchpoint.",
    summarySnippet:
      "Returning renter in JVC needs a fresh shortlist to revive momentum.",
    requirements: [
      { label: "Transaction", value: "Rent" },
      { label: "Target location", value: "Jumeirah Village Circle" },
      { label: "Property type", value: "Apartment" },
      { label: "Bedrooms", value: "2 bedrooms" },
      { label: "Budget band", value: "AED 135K - 165K" },
      { label: "Current need", value: "Reactivation" },
    ],
    conversationPreview: [
      {
        id: "cp-8",
        role: "lead",
        channel: "website",
        content:
          "Following up on the JVC units you shared yesterday. Do you have more options with better amenities?",
        timestamp: "2026-04-02T06:03:00.000Z",
      },
      {
        id: "cp-9",
        role: "ai",
        channel: "website",
        content:
          "Yes, I can narrow the shortlist to amenity-rich towers with stronger gym, pool, and parking offerings. I’ll prepare an updated set for you.",
        timestamp: "2026-04-02T06:04:00.000Z",
      },
    ],
    timeline: [
      {
        id: "tl-10",
        title: "Retargeted lead returned",
        description: "Prior website visitor came back through the saved inquiry sequence.",
        time: "2026-04-01T17:40:00.000Z",
        tone: "brand",
      },
      {
        id: "tl-11",
        title: "Refresh shortlist requested",
        description: "Lead asked for stronger amenities and more refined options.",
        time: "2026-04-02T06:03:00.000Z",
        tone: "blue",
      },
    ],
    followUp: {
      status: "pending",
      nextTouchpoint: "2026-04-02T15:45:00.000Z",
      cadence: "Shortlist refresh",
      owner: "Rhea D'Souza",
      recommendation:
        "Respond with a sharper shortlist and one comparison note to keep decision effort low.",
    },
    crmInsights: [
      "This is a nurture-style opportunity where better curation matters more than more inventory volume.",
    ],
    propertyMatches: [
      {
        id: "pm-5",
        title: "Amenity Collection Residence",
        location: "JVC",
        price: "AED 152K / year",
        fit: "82% match",
      },
    ],
  },
  {
    lead: createLead({
      id: "lead-business-bay-005",
      name: "Huda Al Falasi",
      email: "huda@alfalasi.group",
      phone: "+971 55 944 2001",
      channel: "whatsapp",
      intent: "complaint",
      intentConfidence: 0.9,
      propertyType: "office",
      transactionType: "rent",
      locationPreference: "Business Bay",
      budgetMin: 450000,
      budgetMax: 700000,
      bedrooms: 0,
      status: "escalated",
      isEscalated: true,
      escalationReason: "Requested immediate human intervention regarding delayed commercial callback.",
      updatedAt: "2026-04-02T10:58:00.000Z",
      createdAt: "2026-04-02T10:22:00.000Z",
    }),
    assignedAgent: "Commercial Desk",
    score: 88,
    scoreBand: "high",
    sourceLabel: "WhatsApp commercial inquiry",
    aiSummary:
      "Commercial tenant originally requested premium Business Bay office options, but frustration increased after a delayed response. Escalation is appropriate because the revenue potential remains strong and sentiment is slipping.",
    summarySnippet:
      "High-value commercial renter escalated after response delay on Business Bay office inquiry.",
    requirements: [
      { label: "Transaction", value: "Rent" },
      { label: "Target location", value: "Business Bay" },
      { label: "Property type", value: "Office" },
      { label: "Size need", value: "Executive office footprint" },
      { label: "Budget band", value: "AED 450K - 700K" },
      { label: "Risk", value: "High sentiment sensitivity" },
    ],
    conversationPreview: [
      {
        id: "cp-10",
        role: "lead",
        channel: "whatsapp",
        content:
          "I shared my requirements earlier and still have not received a concrete shortlist. I need someone to call me back urgently.",
        timestamp: "2026-04-02T10:54:00.000Z",
      },
      {
        id: "cp-11",
        role: "ai",
        channel: "whatsapp",
        content:
          "I understand the urgency. I’m escalating this to our commercial specialist now so you receive immediate support with suitable office options.",
        timestamp: "2026-04-02T10:55:00.000Z",
      },
    ],
    timeline: [
      {
        id: "tl-12",
        title: "Commercial lead captured",
        description: "WhatsApp intake created a new premium office requirement record.",
        time: "2026-04-02T10:22:00.000Z",
        tone: "green",
      },
      {
        id: "tl-13",
        title: "Escalation triggered",
        description: "Complaint intent and urgency threshold exceeded safe automation limits.",
        time: "2026-04-02T10:55:00.000Z",
        tone: "red",
      },
      {
        id: "tl-14",
        title: "Commercial desk notified",
        description: "Human handoff package prepared with conversation context and extracted requirements.",
        time: "2026-04-02T10:58:00.000Z",
        tone: "amber",
      },
    ],
    followUp: {
      status: "pending",
      nextTouchpoint: "2026-04-02T11:20:00.000Z",
      cadence: "Immediate human callback",
      owner: "Commercial Desk",
      recommendation:
        "Human response should acknowledge the delay first, then move quickly into a tightly matched office shortlist.",
    },
    crmInsights: [
      "Despite complaint tone, the commercial budget makes this a high-priority rescue opportunity.",
      "AI did the right thing by stepping back once urgency and frustration increased.",
    ],
    propertyMatches: [
      {
        id: "pm-6",
        title: "Canal View Executive Office",
        location: "Business Bay",
        price: "AED 610K / year",
        fit: "87% match",
      },
      {
        id: "pm-7",
        title: "Grade A Corporate Suite",
        location: "Business Bay",
        price: "AED 680K / year",
        fit: "84% match",
      },
    ],
  },
];

export function getLeadRecords(): LeadRecord[] {
  return leadRecords;
}

export function getLeadRecordById(id: string): LeadRecord | undefined {
  return leadRecords.find((record) => record.lead.id === id);
}

export const leadStatusOptions: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "escalated", label: "Escalated" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

export const leadChannelOptions: Array<{ value: Channel | "all"; label: string }> = [
  { value: "all", label: "All channels" },
  { value: "website", label: "Website" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
];
