"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BellRing,
  Bot,
  BrainCircuit,
  MessageSquareMore,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../../components/ui/data-states";
import { PageContainer } from "../../components/dashboard/page-shell";
import { conversationsApi, escalationsApi, followUpsApi, leadsApi } from "../../lib/api";
import type { Conversation, Escalation, FollowUp, Lead, Message } from "../../lib/types";
import { CHANNEL_CONFIG, cn, formatDate, formatRelativeTime } from "../../lib/utils";

function badgeTone(type: "positive" | "neutral" | "sensitive" | "low" | "medium" | "high") {
  switch (type) {
    case "positive":
      return "bg-status-green-subtle text-status-green";
    case "neutral":
      return "bg-status-blue-subtle text-status-blue";
    case "sensitive":
      return "bg-status-red-subtle text-status-red";
    case "low":
      return "bg-white/8 text-content-secondary";
    case "medium":
      return "bg-status-amber-subtle text-status-amber";
    default:
      return "bg-status-red-subtle text-status-red";
  }
}

function bubbleTone(role: Message["role"]) {
  if (role === "assistant") {
    return "ml-8 border-brand-gold/15 bg-brand-gold/[0.06]";
  }
  if (role === "system") {
    return "border-status-red/15 bg-status-red/[0.08]";
  }
  return "mr-8 border-white/8 bg-black/20";
}

function inferSentiment(messages: Message[]) {
  const text = messages.map((message) => message.content.toLowerCase()).join(" ");
  if (/(upset|angry|frustrated|complaint|issue|not happy)/.test(text)) return "sensitive";
  if (/(great|perfect|love|excellent|thanks|thank you)/.test(text)) return "positive";
  return "neutral";
}

function inferUrgency(messages: Message[], escalation: Escalation | null, conversation: Conversation) {
  if (escalation) return "high";
  const text = messages.map((message) => message.content.toLowerCase()).join(" ");
  if (/(urgent|asap|today|now|immediately)/.test(text)) return "high";
  if (messages.length >= 6 || conversation.status === "pending_human") return "medium";
  return "low";
}

function buildDraftReply(lead: Lead | null, messages: Message[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const location = lead?.location_preference ?? "the requested area";
  const property = lead?.property_type?.replaceAll("_", " ") ?? "property options";

  if (!latestUserMessage) {
    return `Thanks for reaching out. Aurevia is preparing a curated ${property} shortlist for ${location}, and the desk will confirm next steps shortly.`;
  }

  return `Thanks for sharing that. I have updated your brief around ${location} and will refine the ${property} shortlist based on your latest note: "${latestUserMessage.content.slice(0, 80)}${latestUserMessage.content.length > 80 ? "..." : ""}". If you prefer, I can route this to a human advisor for a faster review.`;
}

export function ConversationDetailPage({ conversationId }: { conversationId: string }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const conversationRecord = await conversationsApi.get(conversationId);
      const [threadResponse, leadRecord, followUpsResponse, escalationsResponse] = await Promise.all([
        conversationsApi.messages(conversationId, { limit: 100 }),
        conversationRecord.lead_id ? leadsApi.get(conversationRecord.lead_id) : Promise.resolve(null),
        followUpsApi.list({ limit: 100 }),
        escalationsApi.list({ limit: 100 }),
      ]);

      setConversation(conversationRecord);
      setLead(leadRecord);
      setMessages(threadResponse.items);
      setFollowUp(
        followUpsResponse.items.find((item) => item.conversation_id === conversationId) ??
          (conversationRecord.lead_id
            ? followUpsResponse.items.find((item) => item.lead_id === conversationRecord.lead_id) ?? null
            : null),
      );
      setEscalation(
        escalationsResponse.items.find((item) => item.conversation_id === conversationId) ??
          (conversationRecord.lead_id
            ? escalationsResponse.items.find((item) => item.lead_id === conversationRecord.lead_id) ?? null
            : null),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load the conversation view.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  const sentiment = useMemo(() => inferSentiment(messages), [messages]);
  const urgency = useMemo(
    () => (conversation ? inferUrgency(messages, escalation, conversation) : "low"),
    [conversation, escalation, messages],
  );

  if (isLoading) {
    return (
      <PageContainer eyebrow="Single conversation" title="Loading thread" description="Pulling the live thread, contact record, and operational context.">
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <ShimmerCard className="h-[760px] rounded-[30px]" />
          <div className="space-y-5">
            <ShimmerCard className="h-64 rounded-[30px]" />
            <ShimmerCard className="h-64 rounded-[30px]" />
            <ShimmerCard className="h-48 rounded-[30px]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !conversation) {
    return (
      <PageContainer eyebrow="Single conversation" title="Conversation unavailable" description="The live thread could not be opened right now.">
        <ErrorState
          title="Conversation unavailable"
          description={error ?? "The requested conversation was not found."}
          actionLabel="Retry"
          onAction={() => void loadConversation()}
        />
      </PageContainer>
    );
  }

  const channel = CHANNEL_CONFIG[conversation.channel];

  return (
    <PageContainer
      eyebrow="Single conversation"
      title={lead?.name ?? conversation.subject ?? "Conversation thread"}
      description="Full-thread Aurevia inbox view with channel context, AI reply drafting, customer detail, and operational escalation guidance."
      actions={
        <Link
          href="/conversations"
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20 hover:bg-white/8"
        >
          <ArrowLeft className="h-4 w-4 text-brand-gold" />
          Back to inbox
        </Link>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_28%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
          <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                  {channel.label}
                </span>
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(sentiment))}>
                  {sentiment} sentiment
                </span>
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(urgency))}>
                  {urgency} urgency
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                {conversation.summary ?? "Live conversation thread"}
              </h3>
              <p className="mt-2 text-sm text-content-secondary">
                Last updated {formatRelativeTime(conversation.updated_at)}
              </p>
            </div>

            {escalation ? (
              <div className="rounded-2xl border border-status-red/20 bg-status-red/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-status-red">Escalation</p>
                <p className="mt-1 text-sm font-medium text-content-primary">{escalation.reason}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            {messages.length === 0 ? (
              <EmptyState
                title="No stored messages"
                description="The conversation exists, but the message thread has not been persisted yet."
              />
            ) : (
              messages.map((message) => (
                <div key={message.id} className={cn("rounded-[24px] border p-4", bubbleTone(message.role))}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                      {message.role === "assistant" ? "Aurevia AI" : message.role === "user" ? "Lead" : "Human agent"}
                    </span>
                    <span className="text-xs text-content-secondary">{formatDate(message.created_at)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-content-secondary">{message.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-[26px] border border-brand-gold/15 bg-brand-gold/[0.06] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">AI draft reply</p>
                <h4 className="mt-2 text-lg font-semibold text-content-primary">Suggested response</h4>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-content-secondary">{buildDraftReply(lead, messages)}</p>
          </div>
        </article>

        <article className="space-y-5">
          <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-gold">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps">Customer info</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-content-primary">
                  Detail card
                </h3>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Lead</p>
                <p className="mt-2 font-medium text-content-primary">{lead?.name ?? "Unknown contact"}</p>
                <p className="mt-1 text-content-secondary">{lead?.email ?? "No email captured"}</p>
                <p className="text-content-secondary">{lead?.phone ?? "No phone captured"}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Assigned agent</p>
                <p className="mt-2 font-medium text-content-primary">{lead?.assigned_agent_name ?? "Aurevia AI"}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Intent</p>
                <p className="mt-2 font-medium text-content-primary">{lead?.intent?.replaceAll("_", " ") ?? "Discovery"}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-status-green/20 bg-status-green/10 text-status-green">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps">Follow-up state</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-content-primary">
                  Operational routing
                </h3>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Next action</p>
                <p className="mt-2 text-sm font-medium text-content-primary">
                  {followUp ? followUp.next_action : "No follow-up queued"}
                </p>
              </div>
              {escalation ? (
                <div className="rounded-[22px] border border-status-red/20 bg-status-red/10 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4.5 w-4.5 text-status-red" />
                    <p className="text-sm font-medium text-status-red">Escalation active</p>
                  </div>
                  <p className="mt-2 text-sm text-content-secondary">{escalation.reason}</p>
                </div>
              ) : (
                <div className="rounded-[22px] border border-status-blue/20 bg-status-blue/10 p-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4.5 w-4.5 text-status-blue" />
                    <p className="text-sm font-medium text-content-primary">AI is cleared to continue</p>
                  </div>
                  <p className="mt-2 text-sm text-content-secondary">
                    The thread remains inside normal automation thresholds.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">Aurevia summary</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-content-primary">
                  Thread insight
                </h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-content-secondary">
              {conversation.summary ?? "No summary available for this thread yet."}
            </p>
          </div>
        </article>
      </section>
    </PageContainer>
  );
}
