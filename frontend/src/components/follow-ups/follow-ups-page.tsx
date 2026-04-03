"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  PauseCircle,
  PlayCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../../components/ui/data-states";
import { PageContainer } from "../../components/dashboard/page-shell";
import { followUpsApi, leadsApi } from "../../lib/api";
import type { FollowUp, Lead } from "../../lib/types";
import { CHANNEL_CONFIG, cn, formatDate, formatRelativeTime } from "../../lib/utils";

function statusTone(status: FollowUp["status"]) {
  switch (status) {
    case "pending":
      return "bg-status-blue-subtle text-status-blue";
    case "executed":
      return "bg-status-green-subtle text-status-green";
    case "cancelled":
      return "bg-white/8 text-content-secondary";
    case "failed":
      return "bg-status-red-subtle text-status-red";
    default:
      return "bg-status-amber-subtle text-status-amber";
  }
}

function priorityTone(item: FollowUp) {
  if (item.status === "overdue" || item.status === "failed") return "bg-status-red-subtle text-status-red";
  if (item.status === "pending") return "bg-brand-gold/10 text-brand-gold";
  return "bg-white/8 text-content-secondary";
}

function getLeadName(item: FollowUp, leads: Lead[]) {
  return leads.find((lead) => lead.id === item.lead_id)?.name ?? "Unnamed lead";
}

export function FollowUpsPageClient() {
  const [queue, setQueue] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFollowUps = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [followUpsResponse, leadsResponse] = await Promise.all([
        followUpsApi.list({ limit: 100 }),
        leadsApi.list({ limit: 100 }),
      ]);

      setQueue(followUpsResponse.items);
      setLeads(leadsResponse.items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load follow-up automation.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFollowUps();
  }, [loadFollowUps]);

  const overdue = useMemo(
    () =>
      queue.filter(
        (item) =>
          item.status === "overdue" ||
          (item.status === "pending" && new Date(item.scheduled_for ?? item.scheduled_at).getTime() < Date.now()),
      ),
    [queue],
  );

  const healthCards = [
    { label: "Active queue", value: queue.length.toString(), detail: "Live follow-up records currently in the backend queue." },
    { label: "Overdue", value: overdue.length.toString(), detail: "Items that need immediate intervention or rescheduling." },
    { label: "Executed", value: queue.filter((item) => item.status === "executed").length.toString(), detail: "Completed touchpoints captured by the workflow." },
  ];

  return (
    <PageContainer
      eyebrow="Automation cadence"
      title="Follow-up automation queue"
      description="A premium CRM queue for scheduled touchpoints, automation health, and human intervention decisions across the Aurevia workflow."
      actions={
        <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Queue snapshot</p>
          <p className="mt-1 text-lg font-semibold text-content-primary">{queue.length} active items</p>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            <ShimmerCard className="h-36 rounded-[28px]" />
            <ShimmerCard className="h-36 rounded-[28px]" />
            <ShimmerCard className="h-36 rounded-[28px]" />
          </div>
          <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <ShimmerCard className="h-[520px] rounded-[30px]" />
            <ShimmerCard className="h-[520px] rounded-[30px]" />
          </div>
        </div>
      ) : error ? (
        <ErrorState
          title="Follow-up queue unavailable"
          description={error}
          actionLabel="Retry"
          onAction={() => void loadFollowUps()}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {healthCards.map((card) => (
              <article
                key={card.label}
                className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card"
              >
                <p className="label-caps">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-content-primary">{card.value}</p>
                <p className="mt-3 text-sm text-content-secondary">{card.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <article className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),rgba(255,255,255,0.02)_40%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-amber/20 bg-status-amber/10 text-status-amber">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps text-brand-gold/80">Overdue follow-ups</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Immediate attention
                  </h3>
                </div>
              </div>

              {overdue.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {overdue.map((item) => {
                    const channel = CHANNEL_CONFIG[item.channel];
                    return (
                      <div key={item.id} className="rounded-[24px] border border-status-amber/20 bg-black/20 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-content-primary">{getLeadName(item, leads)}</p>
                            <p className="mt-1 text-xs text-content-secondary">{item.next_action}</p>
                          </div>
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                            {channel.label}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-content-secondary">{item.notes ?? "No additional automation note captured."}</p>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs uppercase tracking-[0.2em] text-content-muted">
                            Scheduled {formatDate(item.scheduled_for ?? item.scheduled_at)}
                          </span>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-status-red/20 bg-status-red/10 px-3 py-1 text-xs font-medium text-status-red"
                          >
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Escalate
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Queue is perfectly on time"
                    description="No overdue follow-ups are currently waiting for intervention."
                  />
                </div>
              )}
            </article>

            <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="label-caps text-brand-gold/80">Upcoming queue</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                    Scheduled follow-ups
                  </h3>
                </div>
                <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
                  CRM / SaaS quality layout
                </div>
              </div>

              {queue.length === 0 ? (
                <div className="mt-6">
                  <EmptyState
                    title="No follow-ups scheduled"
                    description="The live backend queue is empty right now."
                    actionLabel="Refresh"
                    onAction={() => void loadFollowUps()}
                  />
                </div>
              ) : (
                <>
                  <div className="mt-6 hidden overflow-hidden rounded-[26px] border border-white/8 lg:block">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-white/8">
                        <thead className="bg-white/[0.03]">
                          <tr className="text-left">
                            {[
                              "Lead",
                              "Status",
                              "Channel",
                              "Scheduled",
                              "Last contact",
                              "Next action",
                              "Priority",
                              "Actions",
                            ].map((label) => (
                              <th key={label} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted">
                                {label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/8">
                          {queue.map((item) => {
                            const channel = CHANNEL_CONFIG[item.channel];
                            return (
                              <tr key={item.id} className="transition hover:bg-brand-gold/[0.04]">
                                <td className="px-4 py-4 align-top">
                                  <p className="font-medium text-content-primary">{getLeadName(item, leads)}</p>
                                  <p className="mt-1 text-xs text-content-secondary">{item.notes ?? "Automation-managed touchpoint"}</p>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone(item.status))}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                                    {channel.label}
                                  </span>
                                </td>
                                <td className="px-4 py-4 align-top text-sm text-content-primary">{formatDate(item.scheduled_for ?? item.scheduled_at)}</td>
                                <td className="px-4 py-4 align-top text-sm text-content-secondary">{formatRelativeTime(item.updated_at)}</td>
                                <td className="px-4 py-4 align-top text-sm text-content-primary">{item.next_action}</td>
                                <td className="px-4 py-4 align-top">
                                  <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", priorityTone(item))}>
                                    {item.status === "overdue" ? "critical" : item.status === "pending" ? "priority" : "normal"}
                                  </span>
                                </td>
                                <td className="px-4 py-4 align-top">
                                  <div className="flex flex-wrap gap-2">
                                    <button type="button" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary">
                                      <PauseCircle className="h-3.5 w-3.5 text-status-amber" />
                                      Pause
                                    </button>
                                    <button type="button" className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary">
                                      <PlayCircle className="h-3.5 w-3.5 text-status-green" />
                                      Resume
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:hidden">
                    {queue.map((item) => {
                      const channel = CHANNEL_CONFIG[item.channel];
                      return (
                        <div key={item.id} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-medium text-content-primary">{getLeadName(item, leads)}</p>
                              <p className="mt-1 text-sm text-content-secondary">{item.next_action}</p>
                            </div>
                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone(item.status))}>
                              {item.status}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                              {channel.label}
                            </span>
                            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", priorityTone(item))}>
                              {item.status === "overdue" ? "critical" : item.status === "pending" ? "priority" : "normal"}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Scheduled</p>
                              <p className="mt-1 text-sm text-content-primary">{formatDate(item.scheduled_for ?? item.scheduled_at)}</p>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Last contact</p>
                              <p className="mt-1 text-sm text-content-primary">{formatRelativeTime(item.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </article>
          </section>

          <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps">Automation reserve</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                  Queue insight panel
                </h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Pause impact forecast</p>
                <div className="mt-4 shimmer h-4 rounded-full" />
                <div className="mt-3 shimmer h-4 w-4/5 rounded-full" />
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Sequence health trend</p>
                <div className="mt-4 shimmer h-4 rounded-full" />
                <div className="mt-3 shimmer h-4 w-3/5 rounded-full" />
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Delivery diagnostics</p>
                <div className="mt-4 shimmer h-4 rounded-full" />
                <div className="mt-3 shimmer h-4 w-2/3 rounded-full" />
              </div>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
