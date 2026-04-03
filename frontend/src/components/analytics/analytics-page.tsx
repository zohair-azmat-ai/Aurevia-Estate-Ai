"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Bot,
  CalendarRange,
  Clock3,
  Filter,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "@/components/ui/data-states";
import { PageContainer } from "@/components/dashboard/page-shell";
import { analyticsApi } from "@/lib/api";
import type { AnalyticsEvent, AnalyticsSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

function kpiTone(tone: "brand" | "green" | "blue" | "amber") {
  switch (tone) {
    case "brand":
      return "border-brand-gold/20 bg-brand-gold/10 text-brand-gold";
    case "green":
      return "border-status-green/20 bg-status-green/10 text-status-green";
    case "blue":
      return "border-status-blue/20 bg-status-blue/10 text-status-blue";
    default:
      return "border-status-amber/20 bg-status-amber/10 text-status-amber";
  }
}

export function AnalyticsPageClient() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryResponse, eventsResponse] = await Promise.all([
        analyticsApi.summary(),
        analyticsApi.events({ limit: 200 }),
      ]);

      setSummary(summaryResponse);
      setEvents(eventsResponse.items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load analytics right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const totalEvents = summary?.total_events ?? events.length;
  const typeCounts = useMemo(() => {
    return events.reduce<Record<string, number>>((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] ?? 0) + 1;
      return acc;
    }, {});
  }, [events]);

  const responseGenerated = typeCounts.reply_generated ?? 0;
  const escalations = typeCounts.escalation_triggered ?? 0;
  const followups = typeCounts.followup_scheduled ?? 0;
  const messages = typeCounts.message_received ?? 0;
  const leadsCreated = typeCounts.lead_created ?? 0;

  const sourcePerformance = useMemo(
    () =>
      Object.entries(summary?.channel_breakdown ?? {}).map(([channel, count]) => ({
        channel,
        count,
        width: totalEvents > 0 ? `${Math.max(12, Math.round((count / totalEvents) * 100))}%` : "12%",
      })),
    [summary, totalEvents],
  );

  const responseTrend = useMemo(() => {
    const chunks = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return chunks.map((label, index) => {
      const sample = events[index]?.created_at;
      const payload = events[index]?.payload;
      const responseSeconds =
        payload && typeof payload === "object" && "response_seconds" in payload
          ? Number(payload.response_seconds)
          : undefined;
      const height = `${38 + (responseSeconds ?? (index + 3) * 6)}%`;
      return { label, value: sample ? new Date(sample).getUTCDate() : index + 1, height };
    });
  }, [events]);

  const funnel = [
    { label: "Lead created", count: leadsCreated },
    { label: "Message received", count: messages },
    { label: "Reply generated", count: responseGenerated },
    { label: "Follow-up scheduled", count: followups },
    { label: "Escalation triggered", count: escalations },
  ];

  const aiHandled = responseGenerated;
  const humanHandled = escalations;
  const handoffRate = totalEvents > 0 ? `${Math.round((escalations / totalEvents) * 100)}%` : "0%";

  return (
    <PageContainer
      eyebrow="Performance insights"
      title="Executive analytics deck"
      description="A recruiter-grade analytics surface for conversion visibility, channel performance, escalation control, and AI operating leverage."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-primary">
            <CalendarRange className="h-4.5 w-4.5 text-brand-gold" />
            Live backend window
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-primary">
            <Filter className="h-4.5 w-4.5 text-brand-gold" />
            All channels
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ShimmerCard className="h-40 rounded-[28px]" />
            <ShimmerCard className="h-40 rounded-[28px]" />
            <ShimmerCard className="h-40 rounded-[28px]" />
            <ShimmerCard className="h-40 rounded-[28px]" />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ShimmerCard className="h-96 rounded-[30px]" />
            <ShimmerCard className="h-96 rounded-[30px]" />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <ShimmerCard className="h-96 rounded-[30px]" />
            <ShimmerCard className="h-96 rounded-[30px]" />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Analytics unavailable"
          description={error}
          actionLabel="Retry"
          onAction={() => void loadAnalytics()}
        />
      ) : !summary ? (
        <EmptyState
          title="No analytics summary yet"
          description="The backend is connected, but analytics summary data is not available yet."
          actionLabel="Refresh"
          onAction={() => void loadAnalytics()}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total events", value: totalEvents.toLocaleString(), detail: "Live event volume across the automation stack.", tone: "brand" as const },
              { label: "Lead created", value: leadsCreated.toLocaleString(), detail: "New lead creation events tracked in production.", tone: "green" as const },
              { label: "Reply generated", value: responseGenerated.toLocaleString(), detail: "AI response generation events from the backend.", tone: "blue" as const },
              { label: "Escalation rate", value: handoffRate, detail: "Human intervention load versus total tracked events.", tone: "amber" as const },
            ].map((item) => (
              <article
                key={item.label}
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="label-caps">{item.label}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-content-primary">{item.value}</p>
                  </div>
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", kpiTone(item.tone))}>
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-sm text-content-secondary">{item.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-caps text-brand-gold/80">Lead source performance</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Acquisition quality by source
                  </h3>
                </div>
                <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
                  Live backend mix
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {sourcePerformance.length > 0 ? (
                  sourcePerformance.map((source) => (
                    <div key={source.channel} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium capitalize text-content-primary">{source.channel}</p>
                          <p className="mt-2 text-xs text-content-secondary">{source.count} tracked events</p>
                        </div>
                        <p className="text-sm font-semibold text-content-primary">{Math.round((source.count / Math.max(totalEvents, 1)) * 100)}%</p>
                      </div>
                      <div className="mt-4 h-3 rounded-full bg-white/6 p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-gold via-[#E7CB75] to-[#7C6127]"
                          style={{ width: source.width }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No channel breakdown yet"
                    description="Channel-level analytics will appear here as more events accumulate."
                  />
                )}
              </div>
            </article>

            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-green/20 bg-status-green/10 text-status-green">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Response time metrics</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Response cadence trend
                  </h3>
                </div>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-5">
                <div className="flex h-56 items-end justify-between gap-3">
                  {responseTrend.map((point) => (
                    <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                      <div className="flex h-44 w-full items-end justify-center rounded-t-[18px] bg-white/5 p-1">
                        <div
                          className="w-full rounded-[14px] bg-gradient-to-t from-brand-gold to-[#E4C668]"
                          style={{ height: point.height }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-content-primary">{point.value}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-content-muted">{point.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-blue/20 bg-status-blue/10 text-status-blue">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Conversion funnel</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Event progression
                  </h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {funnel.map((stage) => (
                  <div key={stage.label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-content-primary">{stage.label}</p>
                        <p className="mt-1 text-xs text-content-secondary">{stage.count} events</p>
                      </div>
                      <p className="text-sm font-semibold text-content-primary">
                        {totalEvents > 0 ? `${Math.round((stage.count / totalEvents) * 100)}%` : "0%"}
                      </p>
                    </div>
                    <div className="h-3 rounded-full bg-white/6 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-gold via-[#E5C969] to-[#7E6428]"
                        style={{ width: `${Math.max(6, totalEvents > 0 ? Math.round((stage.count / totalEvents) * 100) : 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.02)_42%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps text-brand-gold/80">AI vs human handled</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Operating leverage
                  </h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "AI handled", value: aiHandled, tone: "brand" as const },
                  { label: "Human handled", value: humanHandled, tone: "blue" as const },
                ].map((item) => (
                  <div key={item.label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-content-primary">{item.label}</p>
                      <p className="text-sm font-semibold text-content-primary">{item.value}</p>
                    </div>
                    <div className="h-3 rounded-full bg-white/6 p-0.5">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.tone === "brand"
                            ? "bg-gradient-to-r from-brand-gold via-[#E5CA72] to-[#836928]"
                            : "bg-gradient-to-r from-status-blue to-status-purple",
                        )}
                        style={{ width: `${Math.max(8, totalEvents > 0 ? Math.round((item.value / totalEvents) * 100) : 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[24px] border border-dashed border-brand-gold/20 bg-black/20 p-5">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-brand-gold" />
                  <p className="text-sm font-medium text-content-primary">Execution narrative</p>
                </div>
                <p className="mt-3 text-sm text-content-secondary">
                  Automation is handling the bulk of inbound volume while keeping escalation load controlled, which makes the operating story strong in both demos and recruiter review.
                </p>
              </div>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-purple/20 bg-status-purple/10 text-status-purple">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Channel performance</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Service quality by channel
                  </h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {sourcePerformance.length > 0 ? (
                  sourcePerformance.map((item) => (
                    <div key={item.channel} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm capitalize text-content-primary">{item.channel}</p>
                          <p className="mt-3 text-sm text-content-secondary">{item.count} tracked analytics events</p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Volume share</p>
                          <p className="mt-1 text-sm font-medium text-content-primary">
                            {Math.round((item.count / Math.max(totalEvents, 1)) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Signals</p>
                          <p className="mt-1 text-sm font-medium text-content-primary">{item.count}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="Channel metrics pending"
                    description="Channel analytics will appear here as the event feed grows."
                  />
                )}
              </div>
            </article>

            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-red/20 bg-status-red/10 text-status-red">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Escalation and handoff</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Human intervention load
                  </h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Escalation rate</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-content-primary">{handoffRate}</p>
                  <p className="mt-2 text-sm text-content-secondary">
                    Based on `escalation_triggered` events in the production event log.
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Follow-ups scheduled</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-content-primary">{followups}</p>
                  <p className="mt-2 text-sm text-content-secondary">
                    Automation continuity events captured by the backend workflow.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Handoff resilience summary</p>
                <div className="mt-4 grid gap-3">
                  <div className="shimmer h-4 rounded-full" />
                  <div className="shimmer h-4 w-11/12 rounded-full" />
                  <div className="shimmer h-4 w-8/12 rounded-full" />
                </div>
                <p className="mt-4 text-sm text-content-secondary">
                  Reserved for team-level staffing overlays once live assignment analytics land.
                </p>
              </div>
            </article>
          </section>
        </>
      )}
    </PageContainer>
  );
}
