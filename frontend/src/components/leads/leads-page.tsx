"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Filter,
  LoaderCircle,
  Plus,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "@/components/ui/data-states";
import { PageContainer } from "@/components/dashboard/page-shell";
import { leadsApi } from "@/lib/api";
import type { Channel, Lead, LeadIntakePayload, LeadStatus } from "@/lib/types";
import { CHANNEL_CONFIG, STATUS_CONFIG, cn, formatBudget, formatRelativeTime } from "@/lib/utils";

const leadStatusOptions: Array<{ label: string; value: LeadStatus | "all" }> = [
  { label: "All statuses", value: "all" },
  { label: "New", value: "new" },
  { label: "Qualified", value: "qualified" },
  { label: "Contacted", value: "contacted" },
  { label: "Viewing", value: "viewing" },
  { label: "Negotiation", value: "negotiation" },
  { label: "Closed won", value: "closed_won" },
  { label: "Closed lost", value: "closed_lost" },
];

const leadChannelOptions: Array<{ label: string; value: Channel | "all" }> = [
  { label: "All channels", value: "all" },
  { label: "Website", value: "website" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
];

const initialIntake: LeadIntakePayload = {
  channel: "website",
  content: "",
  name: "",
  email: "",
  phone: "",
};

function propertyTypeLabel(value: string | null) {
  if (!value) return "Unspecified";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getLeadScore(lead: Lead) {
  return Math.max(48, Math.min(99, Math.round((lead.intent_confidence ?? 0.62) * 100)));
}

function getScoreTone(score: number) {
  if (score >= 90) return "border-brand-gold/20 bg-brand-gold/10 text-brand-gold";
  if (score >= 78) return "border-status-green/20 bg-status-green/10 text-status-green";
  if (score >= 65) return "border-status-blue/20 bg-status-blue/10 text-status-blue";
  return "border-status-amber/20 bg-status-amber/10 text-status-amber";
}

function getAssignedAgent(lead: Lead) {
  return lead.assigned_agent_name ?? (lead.is_escalated ? "Senior desk review" : "Aurevia AI");
}

function getSummarySnippet(lead: Lead) {
  return (
    lead.ai_summary ??
    `${lead.name ?? "This lead"} is exploring ${propertyTypeLabel(lead.property_type).toLowerCase()} options in ${lead.location_preference ?? "their target area"} with a ${lead.transaction_type ?? "property"} intent.`
  );
}

export function LeadsPageClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [channel, setChannel] = useState<Channel | "all">("all");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [intake, setIntake] = useState<LeadIntakePayload>(initialIntake);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await leadsApi.list({ limit: 100 });
      setLeads(response.items);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load live leads right now.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const summary = getSummarySnippet(lead).toLowerCase();
      const matchesSearch =
        !query ||
        lead.name?.toLowerCase().includes(query) ||
        lead.location_preference?.toLowerCase().includes(query) ||
        lead.property_type?.toLowerCase().includes(query) ||
        getAssignedAgent(lead).toLowerCase().includes(query) ||
        summary.includes(query);

      const matchesStatus = status === "all" || lead.status === status;
      const matchesChannel = channel === "all" || lead.channel === channel;

      return Boolean(matchesSearch && matchesStatus && matchesChannel);
    });
  }, [channel, leads, search, status]);

  const visibleBudget = useMemo(
    () =>
      filteredLeads.reduce((total, lead) => {
        const value = lead.budget_max ?? lead.budget_min ?? 0;
        return total + value;
      }, 0),
    [filteredLeads],
  );

  const escalatedCount = filteredLeads.filter((lead) => lead.is_escalated).length;

  async function submitIntake(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmissionMessage(null);

    try {
      const response = await leadsApi.intake(intake);
      setSubmissionMessage(response.ai_reply ?? response.reply ?? "Lead intake submitted successfully.");
      setIntake(initialIntake);
      await loadLeads();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to submit the intake right now.";
      setSubmissionMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer
      eyebrow="Pipeline management"
      title="Lead CRM workspace"
      description="A high-clarity command table for qualification, routing, and relationship context across every active real estate opportunity."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Visible leads</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{filteredLeads.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Escalated</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{escalatedCount}</p>
          </div>
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_34%,rgba(255,255,255,0.02)_100%)] p-5 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-brand-gold/80">Lead intelligence</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Premium pipeline visibility
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-sm text-content-secondary">
            Designed for recruiter-impressive CRM review: fast scanning, strong hierarchy, and enough context to move directly from signal to action.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
            <p className="label-caps">Qualified value</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-content-primary">
              {formatBudget(visibleBudget || null, null, "AED")}
            </p>
            <p className="mt-2 text-sm text-content-secondary">
              Live opportunity volume pulled from the backend lead book.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="label-caps">Priority attention</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-content-primary">{escalatedCount}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-status-amber/20 bg-status-amber/10 text-status-amber">
                <ShieldAlert className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-sm text-content-secondary">
              Leads currently marked for human review or elevated follow-through.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-5 shadow-card">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <label className="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-content-secondary transition focus-within:border-brand-gold/30 focus-within:bg-white/8">
              <Search className="h-4.5 w-4.5 text-brand-gold" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads, locations, property types, or AI summaries..."
                className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
              />
            </label>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-secondary">
              <Filter className="h-4.5 w-4.5 text-brand-gold" />
              <span>Live desk filters over the production lead API.</span>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-content-secondary">
                <SlidersHorizontal className="h-4 w-4 text-brand-gold" />
                Filters
              </div>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as LeadStatus | "all")}
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-content-primary outline-none transition hover:border-brand-gold/20"
              >
                {leadStatusOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-surface-elevated">
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as Channel | "all")}
                className="h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-content-primary outline-none transition hover:border-brand-gold/20"
              >
                {leadChannelOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-surface-elevated">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-sm text-content-secondary">
              Showing <span className="font-medium text-content-primary">{filteredLeads.length}</span> live lead records.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-4">
              <ShimmerCard className="h-32 rounded-[28px]" />
              <ShimmerCard className="h-32 rounded-[28px]" />
              <ShimmerCard className="h-32 rounded-[28px]" />
            </div>
          ) : error ? (
            <div className="mt-6">
              <ErrorState
                title="Lead feed unavailable"
                description={error}
                actionLabel="Retry"
                onAction={() => void loadLeads()}
              />
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No leads match the current desk view"
                description="Adjust the search terms or reset the filters to bring the live CRM queue back into focus."
                actionLabel="Refresh leads"
                onAction={() => void loadLeads()}
              />
            </div>
          ) : (
            <>
              <div className="mt-6 hidden overflow-hidden rounded-[28px] border border-white/8 xl:block">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/8">
                    <thead className="bg-white/[0.03]">
                      <tr className="text-left">
                        {[
                          "Lead",
                          "Status",
                          "Channel",
                          "Budget",
                          "Location",
                          "Property",
                          "Bedrooms",
                          "AI score",
                          "Agent",
                          "Updated",
                          "AI summary",
                        ].map((label) => (
                          <th
                            key={label}
                            className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-content-muted"
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/8">
                      {filteredLeads.map((lead) => {
                        const channelConfig = CHANNEL_CONFIG[lead.channel];
                        const statusConfig = STATUS_CONFIG[lead.status];
                        const score = getLeadScore(lead);

                        return (
                          <tr
                            key={lead.id}
                            className="group bg-transparent transition hover:bg-brand-gold/[0.04]"
                          >
                            <td className="px-4 py-4 align-top">
                              <Link href={`/leads/${lead.id}`} className="block">
                                <p className="font-medium text-content-primary transition group-hover:text-brand-gold">
                                  {lead.name ?? "Unnamed lead"}
                                </p>
                                <p className="mt-1 text-xs text-content-secondary">{lead.email ?? lead.phone ?? "No primary contact"}</p>
                              </Link>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusConfig.bg, statusConfig.color)}>
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channelConfig.bg, channelConfig.color)}>
                                {channelConfig.label}
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-primary">
                              {formatBudget(lead.budget_min, lead.budget_max, lead.budget_currency)}
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-primary">
                              {lead.location_preference ?? "Open brief"}
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-primary">
                              {propertyTypeLabel(lead.property_type)}
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-primary">
                              {lead.bedrooms && lead.bedrooms > 0 ? `${lead.bedrooms} BR` : "Flexible"}
                            </td>
                            <td className="px-4 py-4 align-top">
                              <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getScoreTone(score))}>
                                {score} / 100
                              </span>
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-primary">
                              {getAssignedAgent(lead)}
                            </td>
                            <td className="px-4 py-4 align-top text-sm text-content-secondary">
                              {formatRelativeTime(lead.updated_at)}
                            </td>
                            <td className="max-w-[320px] px-4 py-4 align-top text-sm text-content-secondary">
                              <p className="line-clamp-2">{getSummarySnippet(lead)}</p>
                              <Link
                                href={`/leads/${lead.id}`}
                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-gold"
                              >
                                Open record
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 grid gap-4 xl:hidden">
                {filteredLeads.map((lead) => {
                  const channelConfig = CHANNEL_CONFIG[lead.channel];
                  const statusConfig = STATUS_CONFIG[lead.status];
                  const score = getLeadScore(lead);

                  return (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="rounded-[26px] border border-white/8 bg-black/20 p-5 transition hover:border-brand-gold/15 hover:bg-brand-gold/[0.04]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-medium text-content-primary">{lead.name ?? "Unnamed lead"}</p>
                          <p className="mt-1 text-sm text-content-secondary">{lead.email ?? lead.phone ?? "No primary contact"}</p>
                        </div>
                        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", getScoreTone(score))}>
                          {score}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", statusConfig.bg, statusConfig.color)}>
                          {statusConfig.label}
                        </span>
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", channelConfig.bg, channelConfig.color)}>
                          {channelConfig.label}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Budget</p>
                          <p className="mt-1 text-sm text-content-primary">
                            {formatBudget(lead.budget_min, lead.budget_max, lead.budget_currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Location</p>
                          <p className="mt-1 text-sm text-content-primary">{lead.location_preference ?? "Open brief"}</p>
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-content-secondary">{getSummarySnippet(lead)}</p>

                      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                        <span className="text-content-secondary">{getAssignedAgent(lead)}</span>
                        <span className="inline-flex items-center gap-1 font-medium text-brand-gold">
                          Open record
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={submitIntake}
          className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.03)_44%,rgba(255,255,255,0.01)_100%)] p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="label-caps text-brand-gold/80">New intake</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Capture a new lead
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <Plus className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-3 text-sm text-content-secondary">
            A lightweight live intake action wired into the backend pipeline, useful for validating end-to-end lead creation without changing the premium CRM layout.
          </p>

          <div className="mt-6 grid gap-3">
            <input
              value={intake.name ?? ""}
              onChange={(event) => setIntake((current) => ({ ...current, name: event.target.value }))}
              placeholder="Lead name"
              className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-content-primary outline-none transition focus:border-brand-gold/20"
            />
            <input
              value={intake.email ?? ""}
              onChange={(event) => setIntake((current) => ({ ...current, email: event.target.value }))}
              placeholder="Email"
              className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-content-primary outline-none transition focus:border-brand-gold/20"
            />
            <input
              value={intake.phone ?? ""}
              onChange={(event) => setIntake((current) => ({ ...current, phone: event.target.value }))}
              placeholder="Phone"
              className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-content-primary outline-none transition focus:border-brand-gold/20"
            />
            <select
              value={intake.channel}
              onChange={(event) => setIntake((current) => ({ ...current, channel: event.target.value as Channel }))}
              className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-content-primary outline-none transition focus:border-brand-gold/20"
            >
              <option value="website" className="bg-surface-elevated">Website</option>
              <option value="whatsapp" className="bg-surface-elevated">WhatsApp</option>
              <option value="email" className="bg-surface-elevated">Email</option>
              <option value="phone" className="bg-surface-elevated">Phone</option>
            </select>
            <textarea
              value={intake.content}
              onChange={(event) => setIntake((current) => ({ ...current, content: event.target.value }))}
              placeholder="Lead message, preferences, budget, and location..."
              rows={6}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-content-primary outline-none transition focus:border-brand-gold/20"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !intake.content.trim()}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand-gold px-4 text-sm font-medium text-background transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Submit live intake
          </button>

          {submissionMessage ? (
            <div className="mt-4 rounded-[22px] border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Pipeline response</p>
              <p className="mt-2 text-sm leading-7 text-content-secondary">{submissionMessage}</p>
            </div>
          ) : null}
        </form>
      </section>
    </PageContainer>
  );
}
