import type { Channel, Conversation, Message } from "../lib/types";
import { getLeadRecordById } from "../lib/mock-leads";

export type ConversationMessageRecord = Message & {
  senderLabel: string;
};

export type ConversationSentiment = "positive" | "neutral" | "sensitive";
export type ConversationUrgency = "low" | "medium" | "high";

export type ConversationRecord = {
  conversation: Conversation;
  leadId: string;
  leadName: string;
  leadEmail: string | null;
  leadPhone: string | null;
  assignedAgent: string | null;
  sourceLabel: string;
  location: string;
  summary: string;
  intentLabel: string;
  sentiment: ConversationSentiment;
  urgency: ConversationUrgency;
  followUpLabel: string;
  escalationLabel: string | null;
  aiDraftReply: string;
  unreadCount: number;
  messages: ConversationMessageRecord[];
};

function buildMessages(
  conversationId: string,
  channel: Channel,
  items: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
    senderLabel: string;
    isAiGenerated?: boolean;
  }>
): ConversationMessageRecord[] {
  return items.map((item) => ({
    id: item.id,
    conversation_id: conversationId,
    role: item.role,
    content: item.content,
    channel,
    is_ai_generated: item.isAiGenerated ?? item.role === "assistant",
    ai_model: item.role === "assistant" ? "gpt-4o" : null,
    tokens_used: item.role === "assistant" ? 428 : null,
    created_at: item.createdAt,
    senderLabel: item.senderLabel,
  }));
}

export const conversationRecords: ConversationRecord[] = [
  {
    conversation: {
      id: "conv-palm-jumeirah-001",
      lead_id: "lead-palm-jumeirah-001",
      channel: "website",
      status: "open",
      external_thread_id: "web-7842",
      created_at: "2026-04-02T09:15:00.000Z",
      updated_at: "2026-04-02T11:52:00.000Z",
    },
    leadId: "lead-palm-jumeirah-001",
    leadName: "Mariam Al Mansoori",
    leadEmail: "mariam@auraprivate.ae",
    leadPhone: "+971 50 481 1140",
    assignedAgent: "Nadim Farouk",
    sourceLabel: "Luxury buyer form",
    location: "Palm Jumeirah",
    summary:
      "Discreet high-value buyer requesting a Palm Jumeirah signature villa and private callback coordination.",
    intentLabel: "Viewing request",
    sentiment: "positive",
    urgency: "high",
    followUpLabel: "Callback at 5:30 PM",
    escalationLabel: null,
    aiDraftReply:
      "I’ve prepared a discreet shortlist of Palm Jumeirah villas aligned to your budget and branded residence preference. I can have Nadim call you after 4 PM with the strongest options and confirm private viewing availability.",
    unreadCount: 2,
    messages: buildMessages("conv-palm-jumeirah-001", "website", [
      {
        id: "m-1",
        role: "user",
        content:
          "I am looking for a signature villa on Palm Jumeirah, ideally furnished, and I can move quickly if the fit is right.",
        createdAt: "2026-04-02T09:17:00.000Z",
        senderLabel: "Mariam Al Mansoori",
      },
      {
        id: "m-2",
        role: "assistant",
        content:
          "I can shortlist premium Palm Jumeirah villas that fit your budget and arrange a private viewing today. Would you prefer a branded residence or beachfront standalone villa?",
        createdAt: "2026-04-02T09:18:00.000Z",
        senderLabel: "Aurevia AI",
      },
      {
        id: "m-3",
        role: "user",
        content:
          "A branded residence is preferred. Please keep it discreet and arrange a callback after 4 PM.",
        createdAt: "2026-04-02T09:19:00.000Z",
        senderLabel: "Mariam Al Mansoori",
      },
      {
        id: "m-4",
        role: "assistant",
        content:
          "Understood. I’ll prepare a discreet shortlist and reserve a callback window for this afternoon.",
        createdAt: "2026-04-02T09:20:00.000Z",
        senderLabel: "Aurevia AI",
      },
    ]),
  },
  {
    conversation: {
      id: "conv-downtown-002",
      lead_id: "lead-downtown-002",
      channel: "whatsapp",
      status: "open",
      external_thread_id: "wa-4409",
      created_at: "2026-04-02T08:10:00.000Z",
      updated_at: "2026-04-02T10:40:00.000Z",
    },
    leadId: "lead-downtown-002",
    leadName: "Omar Rahman",
    leadEmail: "omar@vertexholdings.com",
    leadPhone: "+971 52 721 0088",
    assignedAgent: "Lina Merheb",
    sourceLabel: "WhatsApp direct inquiry",
    location: "Downtown Dubai",
    summary:
      "Buyer comparing premium Downtown 3BR options and asking for sharper pricing context across branded towers.",
    intentLabel: "Pricing inquiry",
    sentiment: "neutral",
    urgency: "medium",
    followUpLabel: "Tower comparison at 8:00 PM",
    escalationLabel: null,
    aiDraftReply:
      "I can compare three branded Downtown towers within your target budget and highlight which units currently offer the strongest view and resale profile. If you’d like, I can also prepare a viewing-ready shortlist.",
    unreadCount: 1,
    messages: buildMessages("conv-downtown-002", "whatsapp", [
      {
        id: "m-5",
        role: "user",
        content:
          "Can you share the current price range for premium three-bedroom apartments in Downtown, especially branded towers?",
        createdAt: "2026-04-02T08:11:00.000Z",
        senderLabel: "Omar Rahman",
      },
      {
        id: "m-6",
        role: "assistant",
        content:
          "Absolutely. Premium three-bedroom residences in Downtown are currently clustering between AED 4.5M and AED 6M depending on tower, view, and furnishing.",
        createdAt: "2026-04-02T08:12:00.000Z",
        senderLabel: "Aurevia AI",
      },
      {
        id: "m-7",
        role: "user",
        content:
          "Helpful. Can you narrow it to towers with stronger long-term value and iconic views?",
        createdAt: "2026-04-02T10:40:00.000Z",
        senderLabel: "Omar Rahman",
      },
    ]),
  },
  {
    conversation: {
      id: "conv-dubai-hills-003",
      lead_id: "lead-dubai-hills-003",
      channel: "email",
      status: "open",
      external_thread_id: "mail-1172",
      created_at: "2026-04-02T07:10:00.000Z",
      updated_at: "2026-04-02T07:58:00.000Z",
    },
    leadId: "lead-dubai-hills-003",
    leadName: "Claire Bennett",
    leadEmail: "claire.bennett@northanchor.co.uk",
    leadPhone: "+44 78 2244 1109",
    assignedAgent: null,
    sourceLabel: "Inbound email",
    location: "Dubai Hills Estate",
    summary:
      "Overseas family buyer in early research mode exploring four-bedroom townhouses and relocation-friendly communities.",
    intentLabel: "Discovery inquiry",
    sentiment: "positive",
    urgency: "low",
    followUpLabel: "Relocation guide tomorrow",
    escalationLabel: null,
    aiDraftReply:
      "Dubai Hills Estate is one of the strongest family-oriented communities in the city. I can send a refined overview of four-bedroom townhouse options, school proximity, and current pricing bands to help with your planning.",
    unreadCount: 0,
    messages: buildMessages("conv-dubai-hills-003", "email", [
      {
        id: "m-8",
        role: "user",
        content:
          "We are considering a move to Dubai later this year and would like to understand townhouse options in Dubai Hills for a family of four.",
        createdAt: "2026-04-02T07:11:00.000Z",
        senderLabel: "Claire Bennett",
      },
      {
        id: "m-9",
        role: "assistant",
        content:
          "Dubai Hills Estate is a strong fit for family buyers. I can outline four-bedroom townhouse options, community features, and a current budget snapshot to help you compare.",
        createdAt: "2026-04-02T07:13:00.000Z",
        senderLabel: "Aurevia AI",
      },
    ]),
  },
  {
    conversation: {
      id: "conv-business-bay-005",
      lead_id: "lead-business-bay-005",
      channel: "whatsapp",
      status: "escalated",
      external_thread_id: "wa-7754",
      created_at: "2026-04-02T10:22:00.000Z",
      updated_at: "2026-04-02T10:58:00.000Z",
    },
    leadId: "lead-business-bay-005",
    leadName: "Huda Al Falasi",
    leadEmail: "huda@alfalasi.group",
    leadPhone: "+971 55 944 2001",
    assignedAgent: "Commercial Desk",
    sourceLabel: "WhatsApp commercial inquiry",
    location: "Business Bay",
    summary:
      "Commercial renter became frustrated after a delayed shortlist. Escalation is active and requires human intervention.",
    intentLabel: "Complaint / escalation",
    sentiment: "sensitive",
    urgency: "high",
    followUpLabel: "Immediate callback",
    escalationLabel: "Commercial desk assigned",
    aiDraftReply:
      "Thank you for your patience. I’ve escalated your request to our commercial specialist, who will contact you shortly with a focused shortlist of Business Bay office options aligned to your brief.",
    unreadCount: 3,
    messages: buildMessages("conv-business-bay-005", "whatsapp", [
      {
        id: "m-10",
        role: "user",
        content:
          "I shared my requirements earlier and still have not received a concrete shortlist. I need someone to call me back urgently.",
        createdAt: "2026-04-02T10:54:00.000Z",
        senderLabel: "Huda Al Falasi",
      },
      {
        id: "m-11",
        role: "assistant",
        content:
          "I understand the urgency. I’m escalating this to our commercial specialist now so you receive immediate support with suitable office options.",
        createdAt: "2026-04-02T10:55:00.000Z",
        senderLabel: "Aurevia AI",
      },
      {
        id: "m-12",
        role: "system",
        content:
          "Escalation triggered due to complaint intent, high urgency, and repeated callback request.",
        createdAt: "2026-04-02T10:58:00.000Z",
        senderLabel: "System",
        isAiGenerated: false,
      },
    ]),
  },
];

export function getConversationRecords() {
  return conversationRecords;
}

export function getConversationRecordById(id: string) {
  return conversationRecords.find((record) => record.conversation.id === id);
}

export function getConversationLeadRecord(id: string) {
  const conversation = getConversationRecordById(id);
  return conversation ? getLeadRecordById(conversation.leadId) : undefined;
}
