"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  BellRing,
  BrainCircuit,
  Clock3,
  MessageSquareMore,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../../components/ui/data-states";
import { PageContainer } from "../../components/dashboard/page-shell";
import { analyticsApi, conversationsApi, escalationsApi, followUpsApi, leadsApi } from "../../lib/api";
import type { AnalyticsEvent, Conversation, Escalation, FollowUp, Lead, Message } from "../../lib/types";
import { CHANNEL_CONFIG, STATUS_CONFIG, cn, formatBudget, formatDate, formatRelativeTime } from "../../lib/utils";

function propertyTypeLabel(value: string | null) {
  if (!value) return "Unspecified";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function scoreTone(score: number) {
  if (score >= 90) return "border-brand-gold/20 bg-brand-gold/10 text-brand-gold";
  if (score >= 78) return "border-status-green/20 bg-status-green/10 text-status-green";
  if (score >= 65) return "border-status-blue/20 bg-status-blue/10 text-status-blue";
  return "border-status-amber/20 bg-status-amber/10 text-status-amber";
}

function timelineTone(eventType: string) {
  if (eventType.includes("escalation")) return "border-status-red/20 bg-status-red/10 text-status-red";
  if (eventType.includes("reply")) return "border-brand-gold/20 bg-brand-gold/10 text-brand-gold";
  if (eventType.includes("message")) return "border-status-blue/20 bg-status-blue/10 text-status-blue";
  if (eventType.includes("followup")) return "border-status-green/20 bg-status-green/10 text-status-green";
  return "border-status-amber/20 bg-status-amber/10 text-status-amber";
}

function getLeadScore(lead: Lead) {
  return Math.max(48, Math.min(99, Math.round((lead.intent_confidence ?? 0.62) * 100)));
}

function getAssignedAgent(lead: Lead) {
  return lead.assigned_agent_name ?? (lead.is_escalated ? "Senior desk review" : "Aurevia AI");
}

function getAiSummary(lead: Lead) {
  return (
    lead.ai_summary ??
    `${lead.name ?? "This lead"} is exploring ${propertyTypeLabel(lead.property_type).toLowerCase()} opportunities in ${lead.location_preference ?? "their target area"} with a ${lead.transaction_type ?? "property"} intent.`
  );
}

function buildRequirements(lead: Lead) {
  return [
    { label: "Transaction", value: lead.transaction_type?.replace("_", " ") ?? "Not specified" },
    { label: "Property type", value: propertyTypeLabel(lead.property_type) },
    { label: "Preferred location", value: lead.location_preference ?? "Open brief" },
    { label: "Bedrooms", value: lead.bedrooms ? `${lead.bedrooms} BR` : "Flexible" },
    { label: "Budget", value: formatBudget(lead.budget_min, lead.budget_max, lead.budget_currency) },
    { label: "Intent", value: lead.intent?.replace("_", " ") ?? "Discovery" },
  ];
}

function buildInsights(lead: Lead, conversation: Conversation | null, followUp: FollowUp | null, escalation: Escalation | null) {
  const insights = [
    `AI qualification confidence is ${Math.round((lead.intent_confidence ?? 0.62) * 100)}%, with the latest summary anchored around ${lead.location_preference ?? "an open location brief"}.`,
    `Primary routing channel is ${lead.channel}, and the desk owner is currently ${getAssignedAgent(lead)}.`,
  ];

  if (conversation?.summary) {
    insights.push(conversation.summary);
  }

  if (followUp) {
    insights.push(`Next follow-up action is ${followUp.next_action} and is currently marked ${followUp.status.replace("_", " ")}.`);
  }

  if (escalation) {
    insights.push(`Escalation has been raised for ${escalation.reason} with ${escalation.priority} priority handling.`);
  }

  return insights;
}

function buildPropertyMatches(lead: Lead) {
  const location = lead.location_preference ?? "Dubai";
  const property = propertyTypeLabel(lead.property_type);
  const price = formatBudget(lead.budget_min, lead.budget_max, lead.budget_currency);

  return [
    {
      id: `${lead.id}-match-1`,
      title: `${property} shortlist`,
      location,
      price,
      fit: "Strong fit",
    },
    {
      id: `${lead.id}-match-2`,
      title: `${location} premium alternative`,
      location: `${location} fringe`,
      price,
      fit: "AI curated",
    },
    {
      id: `${lead.id}-match-3`,
      title: "Investor-ready option",
      location,
      price,
      fit: "Needs review",
    },
  ];
}

export function LeadDetailPage({ leadId }: { leadId: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeadRecord = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [leadRecord, conversationsResponse, followUpsResponse, escalationsResponse, eventsResponse] =
        await Promise.all([
          leadsApi.get(leadId),
          conversationsApi.list({ limit: 100 }),
          followUpsApi.list({ limit: 100 }),
          escalationsApi.list({ limit: 100 }),
          analyticsApi.events({ limit: 200 }),
        ]);

      setLead(leadRecord);

      const relatedConversation =
        conversationsResponse.items.find((item) => item.lead_id === leadId) ?? null;
      setConversation(relatedConversation);

      if (relatedConversation) {
        const thread = await conversationsApi.messages(relatedConversation.id, { limit: 50 });
        setMessages(thread.items);
      } else {
        setMessages([]);
      }

      const relatedFollowUps = followUpsResponse.items
        .filter((item) => item.lead_id === leadId)
        .sort(
          (a, b) =>
            +new Date(b.scheduled_for ?? b.scheduled_at) -
            +new Date(a.scheduled_for ?? a.scheduled_at),
        );
      setFollowUp(relatedFollowUps[0] ?? null);

      const relatedEscalations = escalationsResponse.items
        .filter((item) => item.lead_id === leadId)
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      setEscalation(relatedEscalations[0] ?? null);

      setEvents(
        eventsResponse.items
          .filter((item) => item.lead_id === leadId)
          .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)),
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load the live lead record.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    void loadLeadRecord();
  }, [loadLeadRecord]);

  const requirements = useMemo(() => (lead ? buildRequirements(lead) : []), [lead]);
  const crmInsights = useMemo(
    () => (lead ? buildInsights(lead, conversation, followUp, escalation) : []),
    [conversation, escalation, followUp, lead],
  );
  const propertyMatches = useMemo(() => (lead ? buildPropertyMatches(lead) : []), [lead]);

  if (isLoading) {
    return (
      <PageContainer eyebrow="Lead record" title="Loading lead profile" description="Pulling the live CRM record, thread state, and follow-up context.">
        <div className="grid gap-5">
          <ShimmerCard className="h-56 rounded-[30px]" />
          <div className="grid gap-5 xl:grid-cols-2">
            <ShimmerCard className="h-72 rounded-[30px]" />
            <ShimmerCard className="h-72 rounded-[30px]" />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ShimmerCard className="h-80 rounded-[30px]" />
            <ShimmerCard className="h-80 rounded-[30px]" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !lead) {
    return (
      <PageContainer eyebrow="Lead record" title="Lead profile unavailable" description="The live CRM detail view could not be opened right now.">
        <ErrorState
          title="Lead record unavailable"
          description={error ?? "The requested lead was not found."}
          actionLabel="Retry"
          onAction={() => void loadLeadRecord()}
        />
      </PageContainer>
    );
  }

  const channelConfig = CHANNEL_CONFIG[lead.channel];
  const statusConfig = STATUS_CONFIG[lead.status];
  const score = getLeadScore(lead);

  return (
    <PageContainer
      eyebrow="Lead record"
      title={lead.name ?? "Lead profile"}
      description="CRM-grade lead context with structured requirements, AI memory, recent conversation state, and follow-up guidance."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/leads"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20 hover:bg-white/8"
          >
            <ArrowLeft className="h-4 w-4 text-brand-gold" />
            Back to leads
          </Link>
          <div className={cn("rounded-2xl border px-4 py-3", scoreTone(score))}>
            <p className="text-xs uppercase tracking-[0.2em]">AI qualification</p>
            <p className="mt-1 text-lg font-semibold">{score} / 100</p>
          </div>
        </div>
      }
    >
      <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusConfig.bg, statusConfig.color)}>
                {statusConfig.label}
              </span>
              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channelConfig.bg, channelConfig.color)}>
                {channelConfig.label}
              </span>
              {lead.is_escalated || escalation ? (
                <span className="inline-flex rounded-full bg-status-red-subtle px-2.5 py-1 text-xs font-medium text-status-red">
                  Escalated
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-content-primary">
              {lead.name ?? "Unnamed lead"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-content-secondary">{getAiSummary(lead)}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Budget</p>
                <p className="mt-2 text-sm font-medium text-content-primary">
                  {formatBudget(lead.budget_min, lead.budget_max, lead.budget_currency)}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Location</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{lead.location_preference ?? "Open brief"}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Agent</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{getAssignedAgent(lead)}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Updated</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{formatRelativeTime(lead.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[320px] rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,17,24,0.86),rgba(10,10,15,0.92))] p-5">
            <p className="label-caps text-brand-gold/80">Lead profile</p>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-4.5 w-4.5 text-brand-gold" />
                <div>
                  <p className="text-content-primary">{lead.email ?? "No email captured"}</p>
                  <p className="text-content-secondary">{lead.phone ?? "No phone captured"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BrainCircuit className="mt-0.5 h-4.5 w-4.5 text-brand-gold" />
                <div>
                  <p className="text-content-primary">Intent: {lead.intent?.replace("_", " ") ?? "Discovery"}</p>
                  <p className="text-content-secondary">
                    Confidence {Math.round((lead.intent_confidence ?? 0) * 100)}%
                  </p>
                </div>
              </div>
              {lead.is_escalated || escalation ? (
                <div className="rounded-2xl border border-status-red/20 bg-status-red/10 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4.5 w-4.5 text-status-red" />
                    <p className="text-sm font-medium text-status-red">Escalation active</p>
                  </div>
                  <p className="mt-2 text-sm text-content-secondary">
                    {escalation?.reason ?? lead.escalation_reason ?? "Escalated for human review."}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps">Lead requirements</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Structured buying brief
              </h3>
            </div>
            <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
              CRM-ready profile
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {requirements.map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.02)_40%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps text-brand-gold/80">AI summary</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Conversion narrative
              </h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-content-secondary">{getAiSummary(lead)}</p>
          <div className="mt-6 rounded-[22px] border border-white/8 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Property type</p>
            <p className="mt-2 text-sm font-medium text-content-primary">{propertyTypeLabel(lead.property_type)}</p>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-blue/20 bg-status-blue/10 text-status-blue">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps">Conversation preview</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Recent thread context
              </h3>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No live conversation yet"
                description="The lead record is connected, but no thread has been created for this contact in the backend yet."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {messages.slice(0, 4).map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-[24px] border p-4",
                    message.role === "assistant"
                      ? "ml-4 border-brand-gold/15 bg-brand-gold/[0.06]"
                      : "mr-4 border-white/8 bg-black/20",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                      {message.role === "assistant" ? "Aurevia AI" : message.role === "user" ? "Lead" : "Human agent"}
                    </span>
                    <span className="text-xs text-content-secondary">{formatDate(message.created_at)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-content-secondary">{message.content}</p>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-green/20 bg-status-green/10 text-status-green">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps">Follow-up status</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Next touchpoint
              </h3>
            </div>
          </div>

          {followUp ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Status</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{followUp.status.replace("_", " ")}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Channel</p>
                <p className="mt-2 text-sm font-medium text-content-primary">{followUp.channel}</p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4.5 w-4.5 text-brand-gold" />
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Scheduled</p>
                </div>
                <p className="mt-2 text-sm font-medium text-content-primary">{formatDate(followUp.scheduled_for ?? followUp.scheduled_at)}</p>
              </div>
              <div className="rounded-[22px] border border-brand-gold/15 bg-brand-gold/[0.06] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Aurevia recommendation</p>
                <p className="mt-2 text-sm text-content-primary">{followUp.next_action}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="No follow-up queued"
                description="The backend has not scheduled a follow-up for this lead yet."
              />
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-gold">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps">CRM insights</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Notes and guidance
              </h3>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {crmInsights.map((insight) => (
              <div key={insight} className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-sm leading-7 text-content-secondary">{insight}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[22px] border border-white/8 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Record created</p>
            <p className="mt-2 text-sm font-medium text-content-primary">{formatDate(lead.created_at)}</p>
            <p className="mt-2 text-sm text-content-secondary">Last updated {formatRelativeTime(lead.updated_at)}.</p>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps">Activity timeline</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                CRM event trail
              </h3>
            </div>
            <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
              {events.length} events
            </div>
          </div>

          {events.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No analytics events yet"
                description="Once the lead moves through intake, replies, and automation steps, the timeline will populate here."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex gap-4">
                  <div className={cn("mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border", timelineTone(event.event_type))}>
                    <span className="h-2.5 w-2.5 rounded-full bg-current" />
                  </div>
                  <div className="flex-1 rounded-[22px] border border-white/8 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium capitalize text-content-primary">{event.event_type.replaceAll("_", " ")}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{formatRelativeTime(event.created_at)}</p>
                    </div>
                    <p className="mt-2 text-sm text-content-secondary">
                      {event.payload ? JSON.stringify(event.payload) : "No additional payload captured."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="label-caps text-brand-gold/80">Property match panel</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
              Suggested inventory alignment
            </h3>
          </div>
          <p className="max-w-2xl text-sm text-content-secondary">
            This panel stays intentionally premium while the real listing-match engine catches up. It now derives its prompts from the live lead brief instead of mock CRM content.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {propertyMatches.map((match) => (
            <div key={match.id} className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <p className="text-lg font-medium text-content-primary">{match.title}</p>
              <p className="mt-2 text-sm text-content-secondary">{match.location}</p>
              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-content-primary">{match.price}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full border border-brand-gold/15 bg-brand-gold/10 px-2.5 py-1 text-xs font-medium text-brand-gold">
                  {match.fit}
                </span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-brand-gold"
                >
                  Review
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  );
}
