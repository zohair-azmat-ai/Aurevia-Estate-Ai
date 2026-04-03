"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../ui/data-states";
import { PageContainer } from "../dashboard/page-shell";
import { escalationsApi, leadsApi } from "../../lib/api";
import type { Escalation, Lead } from "../../lib/types";
import { CHANNEL_CONFIG, cn, formatRelativeTime } from "../../lib/utils";

function severityTone(priority: Escalation["priority"]) {
  switch (priority) {
    case "critical":
      return "bg-status-red-subtle text-status-red";
    case "high":
      return "bg-status-amber-subtle text-status-amber";
    default:
      return "bg-status-blue-subtle text-status-blue";
  }
}

function statusTone(status: Escalation["status"]) {
  switch (status) {
    case "assigned":
      return "bg-status-green-subtle text-status-green";
    case "review":
      return "bg-brand-gold/10 text-brand-gold";
    case "resolved":
      return "bg-white/8 text-content-secondary";
    default:
      return "bg-status-amber-subtle text-status-amber";
  }
}

function getLeadName(item: Escalation, leads: Lead[]) {
  return leads.find((lead) => lead.id === item.lead_id)?.name ?? "Unknown lead";
}

export function EscalationsPageClient() {
  const [queue, setQueue] = useState<Escalation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEscalations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [escalationsResponse, leadsResponse] = await Promise.all([
        escalationsApi.list({ limit: 100 }),
        leadsApi.list({ limit: 100 }),
      ]);

      setQueue(escalationsResponse.items);
      setLeads(leadsResponse.items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load the escalation desk.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEscalations();
  }, [loadEscalations]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Open escalations",
        value: queue.filter((item) => item.status !== "resolved").length.toString(),
        detail: "High-priority cases still inside the operations desk.",
      },
      {
        label: "Critical",
        value: queue.filter((item) => item.priority === "critical").length.toString(),
        detail: "Urgent records requiring immediate human review.",
      },
      {
        label: "Resolved",
        value: queue.filter((item) => item.status === "resolved").length.toString(),
        detail: "Escalations already closed out by the team.",
      },
    ],
    [queue],
  );

  return (
    <PageContainer
      eyebrow="Human intervention"
      title="Escalation operations desk"
      description="A premium priority queue for high-risk conversations, human handoff timing, and intervention decisions."
      actions={
        <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Critical focus</p>
          <p className="mt-1 text-lg font-semibold text-content-primary">
            {queue.filter((item) => item.priority === "critical").length} urgent cases
          </p>
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
          <ShimmerCard className="h-[640px] rounded-[30px]" />
        </div>
      ) : error ? (
        <ErrorState
          title="Escalation desk unavailable"
          description={error}
          actionLabel="Retry"
          onAction={() => void loadEscalations()}
        />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
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

          <section className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label-caps text-brand-gold/80">Escalation queue</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                  Priority handoff board
                </h3>
              </div>
              <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
                SLA-sensitive routing
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="No active escalations"
                  description="The queue is clear and all high-priority conversations are within safe automation thresholds."
                  actionLabel="Refresh"
                  onAction={() => void loadEscalations()}
                />
              </div>
            ) : (
              <>
                <div className="mt-6 hidden overflow-hidden rounded-[26px] border border-white/8 lg:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/8">
                      <thead className="bg-white/[0.03]">
                        <tr className="text-left">
                          {["Lead", "Severity", "Channel", "Assigned", "Waiting", "Type", "Reason", "Status", "Actions"].map((label) => (
                            <th key={label} className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted">
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/8">
                        {queue.map((item) => {
                          const lead = leads.find((candidate) => candidate.id === item.lead_id) ?? null;
                          const channel = CHANNEL_CONFIG[lead?.channel ?? "website"];
                          return (
                            <tr key={item.id} className="transition hover:bg-brand-gold/[0.04]">
                              <td className="px-4 py-4 align-top text-sm font-medium text-content-primary">{getLeadName(item, leads)}</td>
                              <td className="px-4 py-4 align-top">
                                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", severityTone(item.priority))}>
                                  {item.priority}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                                  {channel.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-top text-sm text-content-primary">{item.assigned_to ?? "Unassigned"}</td>
                              <td className="px-4 py-4 align-top text-sm text-content-primary">{formatRelativeTime(item.created_at)}</td>
                              <td className="px-4 py-4 align-top text-sm text-content-secondary">{item.escalation_type.replaceAll("_", " ")}</td>
                              <td className="max-w-[340px] px-4 py-4 align-top text-sm text-content-secondary">{item.reason}</td>
                              <td className="px-4 py-4 align-top">
                                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone(item.status))}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap gap-2">
                                  <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary">Assign</button>
                                  <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary">Review</button>
                                  <button type="button" className="rounded-full border border-brand-gold/15 bg-brand-gold/10 px-3 py-1 text-xs font-medium text-brand-gold">Resolve</button>
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
                    const lead = leads.find((candidate) => candidate.id === item.lead_id) ?? null;
                    const channel = CHANNEL_CONFIG[lead?.channel ?? "website"];

                    return (
                      <div key={item.id} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-medium text-content-primary">{getLeadName(item, leads)}</p>
                            <p className="mt-1 text-sm text-content-secondary">{item.reason}</p>
                          </div>
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", severityTone(item.priority))}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channel.bg, channel.color)}>
                            {channel.label}
                          </span>
                          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusTone(item.status))}>
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Assigned</p>
                            <p className="mt-1 text-sm text-content-primary">{item.assigned_to ?? "Unassigned"}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Waiting</p>
                            <p className="mt-1 text-sm text-content-primary">{formatRelativeTime(item.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">Ops reserve</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">Escalation insight panel</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <AlertTriangle className="h-5 w-5 text-brand-gold" />
                <p className="mt-4 text-sm font-medium text-content-primary">SLA breach forecast</p>
                <p className="mt-2 text-sm text-content-secondary">Reserved for predictive risk scoring once live event streams are connected.</p>
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <ArrowRight className="h-5 w-5 text-brand-gold" />
                <p className="mt-4 text-sm font-medium text-content-primary">Team load balancing</p>
                <p className="mt-2 text-sm text-content-secondary">Placeholder for smart assignment recommendations across agent desks.</p>
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <ShieldAlert className="h-5 w-5 text-brand-gold" />
                <p className="mt-4 text-sm font-medium text-content-primary">Policy exceptions</p>
                <p className="mt-2 text-sm text-content-secondary">Reserved for compliance-sensitive escalations and policy override logging.</p>
              </div>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
