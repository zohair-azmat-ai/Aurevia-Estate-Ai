"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BellRing,
  Bot,
  MessageSquareMore,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "@/components/ui/data-states";
import { PageContainer } from "@/components/dashboard/page-shell";
import { conversationsApi, escalationsApi, followUpsApi, leadsApi } from "@/lib/api";
import type { Conversation, Escalation, FollowUp, Lead, Message } from "@/lib/types";
import { CHANNEL_CONFIG, cn, formatRelativeTime } from "@/lib/utils";

type SentimentTone = "positive" | "neutral" | "sensitive";
type UrgencyTone = "low" | "medium" | "high";

function badgeTone(type: SentimentTone | UrgencyTone) {
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

function threadBubbleClasses(role: Message["role"]) {
  if (role === "assistant") {
    return "ml-8 border-brand-gold/15 bg-brand-gold/[0.06]";
  }
  if (role === "system") {
    return "border-status-red/15 bg-status-red/[0.08]";
  }
  return "mr-8 border-white/8 bg-black/20";
}

function inferSentiment(messages: Message[]): SentimentTone {
  const text = messages.map((message) => message.content.toLowerCase()).join(" ");
  if (/(upset|angry|frustrated|disappointed|complaint|not happy|issue)/.test(text)) {
    return "sensitive";
  }
  if (/(great|perfect|love|excellent|thanks|thank you)/.test(text)) {
    return "positive";
  }
  return "neutral";
}

function inferUrgency(conversation: Conversation, messages: Message[], escalation: Escalation | null): UrgencyTone {
  if (escalation) return "high";
  const text = messages.map((message) => message.content.toLowerCase()).join(" ");
  if (/(urgent|asap|today|now|immediately)/.test(text)) return "high";
  if (messages.length >= 6 || conversation.status === "pending_human") return "medium";
  return "low";
}

function buildDraftReply(lead: Lead | null, messages: Message[]) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
  const brief = lead?.location_preference ?? "the requested area";
  const propertyType = lead?.property_type?.replaceAll("_", " ") ?? "property options";

  if (!latestUserMessage) {
    return `Thanks for reaching out. Aurevia is preparing a curated ${propertyType} shortlist for ${brief}, and the desk will follow up with the next best options shortly.`;
  }

  return `Thanks for the update. I have noted your latest message about "${latestUserMessage.content.slice(0, 72)}${latestUserMessage.content.length > 72 ? "..." : ""}" and I am refining a ${propertyType} shortlist around ${brief}. I can also arrange the next step with a human advisor if you'd like a faster review.`;
}

function getLeadName(lead: Lead | null, conversation: Conversation) {
  return lead?.name ?? conversation.subject ?? "Unnamed lead";
}

export function ConversationsPageClient() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [conversationsResponse, leadsResponse, followUpsResponse, escalationsResponse] =
        await Promise.all([
          conversationsApi.list({ limit: 100 }),
          leadsApi.list({ limit: 100 }),
          followUpsApi.list({ limit: 100 }),
          escalationsApi.list({ limit: 100 }),
        ]);

      const baseConversations = conversationsResponse.items;
      const messageResponses = await Promise.all(
        baseConversations.map(async (conversation) => {
          const thread = await conversationsApi.messages(conversation.id, { limit: 50 });
          return [conversation.id, thread.items] as const;
        }),
      );

      setConversations(baseConversations);
      setLeads(leadsResponse.items);
      setFollowUps(followUpsResponse.items);
      setEscalations(escalationsResponse.items);
      setMessagesByConversation(Object.fromEntries(messageResponses));
      setActiveId((current) => current || baseConversations[0]?.id || "");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load the live inbox.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  const filteredConversations = useMemo(() => {
    const search = query.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const lead = leads.find((item) => item.id === conversation.lead_id) ?? null;
      const messages = messagesByConversation[conversation.id] ?? [];
      const summary = conversation.summary ?? messages[messages.length - 1]?.content ?? "";

      if (!search) return true;

      return (
        getLeadName(lead, conversation).toLowerCase().includes(search) ||
        summary.toLowerCase().includes(search) ||
        (lead?.location_preference ?? "").toLowerCase().includes(search) ||
        (lead?.intent ?? "").toLowerCase().includes(search)
      );
    });
  }, [conversations, leads, messagesByConversation, query]);

  const activeConversation =
    filteredConversations.find((conversation) => conversation.id === activeId) ??
    filteredConversations[0] ??
    null;

  const activeLead = activeConversation
    ? leads.find((lead) => lead.id === activeConversation.lead_id) ?? null
    : null;
  const activeMessages = activeConversation ? messagesByConversation[activeConversation.id] ?? [] : [];
  const activeEscalation = activeConversation
    ? escalations.find((item) => item.conversation_id === activeConversation.id) ??
      (activeLead ? escalations.find((item) => item.lead_id === activeLead.id) ?? null : null)
    : null;
  const activeFollowUp = activeConversation
    ? followUps.find((item) => item.conversation_id === activeConversation.id) ??
      (activeLead ? followUps.find((item) => item.lead_id === activeLead.id) ?? null : null)
    : null;

  return (
    <PageContainer
      eyebrow="Unified inbox"
      title="Conversation command center"
      description="A premium Aurevia inbox for reviewing every thread, AI draft, sentiment signal, and escalation decision across channels."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Open threads</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{filteredConversations.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Escalated</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">
              {escalations.length}
            </p>
          </div>
        </div>
      }
    >
      <section className="grid gap-5 xl:grid-cols-[0.92fr_1.4fr_0.88fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps">Conversation list</p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-content-primary">
                Unified inbox
              </h3>
            </div>
          </div>

          <label className="mt-5 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-content-secondary transition focus-within:border-brand-gold/30">
            <Search className="h-4.5 w-4.5 text-brand-gold" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
            />
          </label>

          {isLoading ? (
            <div className="mt-5 space-y-3">
              <ShimmerCard className="h-32 rounded-[24px]" />
              <ShimmerCard className="h-32 rounded-[24px]" />
              <ShimmerCard className="h-32 rounded-[24px]" />
            </div>
          ) : error ? (
            <div className="mt-5">
              <ErrorState
                title="Inbox unavailable"
                description={error}
                actionLabel="Retry"
                onAction={() => void loadInbox()}
              />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No conversations found"
                description="The live inbox is connected, but no threads match the current search."
                actionLabel="Refresh inbox"
                onAction={() => void loadInbox()}
              />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredConversations.map((conversation) => {
                const lead = leads.find((item) => item.id === conversation.lead_id) ?? null;
                const messages = messagesByConversation[conversation.id] ?? [];
                const summary = conversation.summary ?? messages[messages.length - 1]?.content ?? "No recent summary available.";
                const urgency = inferUrgency(
                  conversation,
                  messages,
                  escalations.find((item) => item.conversation_id === conversation.id) ?? null,
                );
                const active = activeConversation?.id === conversation.id;
                const channel = CHANNEL_CONFIG[conversation.channel];

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={cn(
                      "w-full rounded-[24px] border p-4 text-left transition",
                      active
                        ? "border-brand-gold/20 bg-brand-gold/[0.08]"
                        : "border-white/8 bg-black/20 hover:border-brand-gold/15 hover:bg-brand-gold/[0.04]",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-content-primary">{getLeadName(lead, conversation)}</p>
                        <p className="mt-1 text-xs text-content-secondary">{lead?.location_preference ?? "Location pending"}</p>
                      </div>
                      {conversation.status === "pending_human" ? (
                        <span className="rounded-full bg-brand-gold/15 px-2 py-0.5 text-xs font-medium text-brand-gold">
                          Human
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                        {channel.label}
                      </span>
                      <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(urgency))}>
                        {urgency} urgency
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-content-secondary">{summary}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-content-muted">
                      {formatRelativeTime(conversation.updated_at)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_28%,rgba(255,255,255,0.02)_100%)] p-5 shadow-card">
          {isLoading ? (
            <div className="grid gap-4">
              <ShimmerCard className="h-24 rounded-[24px]" />
              <ShimmerCard className="h-32 rounded-[24px]" />
              <ShimmerCard className="h-32 rounded-[24px]" />
              <ShimmerCard className="h-32 rounded-[24px]" />
            </div>
          ) : activeConversation ? (
            <>
              <div className="flex flex-col gap-4 border-b border-white/8 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", CHANNEL_CONFIG[activeConversation.channel].bg, CHANNEL_CONFIG[activeConversation.channel].color)}>
                      {CHANNEL_CONFIG[activeConversation.channel].label}
                    </span>
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(inferSentiment(activeMessages)))}>
                      {inferSentiment(activeMessages)} sentiment
                    </span>
                    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", badgeTone(inferUrgency(activeConversation, activeMessages, activeEscalation)))}>
                      {inferUrgency(activeConversation, activeMessages, activeEscalation)} urgency
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    {getLeadName(activeLead, activeConversation)}
                  </h3>
                  <p className="mt-2 text-sm text-content-secondary">
                    {activeConversation.summary ?? activeMessages[activeMessages.length - 1]?.content ?? "No thread summary yet."}
                  </p>
                </div>

                <Link
                  href={`/conversations/${activeConversation.id}`}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20"
                >
                  Open full view
                  <ArrowRight className="h-4 w-4 text-brand-gold" />
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {activeMessages.length === 0 ? (
                  <EmptyState
                    title="No messages in thread"
                    description="The conversation exists in the backend, but no messages have been stored yet."
                  />
                ) : (
                  activeMessages.map((message) => (
                    <div key={message.id} className={cn("rounded-[24px] border p-4", threadBubbleClasses(message.role))}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                          {message.role === "assistant" ? "Aurevia AI" : message.role === "user" ? "Lead" : "Human agent"}
                        </span>
                        <span className="text-xs text-content-secondary">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-content-secondary">{message.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 rounded-[26px] border border-brand-gold/15 bg-brand-gold/[0.06] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="label-caps text-brand-gold/80">AI draft reply</p>
                    <h4 className="mt-2 text-lg font-semibold text-content-primary">
                      Suggested next response
                    </h4>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-content-secondary">
                  {buildDraftReply(activeLead, activeMessages)}
                </p>
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[26px] border border-dashed border-brand-gold/20 bg-black/20 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                No conversation selected
              </h3>
              <p className="mt-3 max-w-xl text-sm text-content-secondary">
                Adjust the inbox search or choose a conversation from the left panel to inspect the active thread.
              </p>
            </div>
          )}
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
          {isLoading ? (
            <div className="space-y-4">
              <ShimmerCard className="h-24 rounded-[22px]" />
              <ShimmerCard className="h-24 rounded-[22px]" />
              <ShimmerCard className="h-24 rounded-[22px]" />
            </div>
          ) : activeConversation ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-gold">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Customer context</p>
                  <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-content-primary">
                    Detail card
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Lead</p>
                  <p className="mt-2 text-sm font-medium text-content-primary">{getLeadName(activeLead, activeConversation)}</p>
                  <p className="mt-1 text-sm text-content-secondary">{activeLead?.email ?? "No email captured"}</p>
                  <p className="text-sm text-content-secondary">{activeLead?.phone ?? "No phone captured"}</p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Intent</p>
                  <p className="mt-2 text-sm font-medium text-content-primary">
                    {activeLead?.intent?.replaceAll("_", " ") ?? "Discovery"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Assigned agent</p>
                  <p className="mt-2 text-sm font-medium text-content-primary">
                    {activeLead?.assigned_agent_name ?? "Aurevia AI"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-status-green/20 bg-status-green/10 p-4">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4.5 w-4.5 text-status-green" />
                    <p className="text-sm font-medium text-content-primary">Follow-up</p>
                  </div>
                  <p className="mt-2 text-sm text-content-secondary">
                    {activeFollowUp
                      ? `${activeFollowUp.status.replaceAll("_", " ")} • ${formatRelativeTime(activeFollowUp.scheduled_for ?? activeFollowUp.scheduled_at)}`
                      : "No active follow-up scheduled"}
                  </p>
                </div>
                {activeEscalation ? (
                  <div className="rounded-[22px] border border-status-red/20 bg-status-red/10 p-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4.5 w-4.5 text-status-red" />
                      <p className="text-sm font-medium text-status-red">Escalation</p>
                    </div>
                    <p className="mt-2 text-sm text-content-secondary">{activeEscalation.reason}</p>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </article>
      </section>
    </PageContainer>
  );
}
