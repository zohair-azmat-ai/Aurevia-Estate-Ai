"use client";

import { useCallback, useEffect, useState } from "react";
import { BellRing, Bot, LockKeyhole, Save, Settings2, Sparkles } from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "../ui/data-states";
import { PageContainer } from "../dashboard/page-shell";
import { settingsApi } from "../../lib/api";
import type { AppSettings } from "../../lib/types";

function iconFor(id: string) {
  switch (id) {
    case "ai":
      return Bot;
    case "notifications":
      return BellRing;
    case "security":
      return LockKeyhole;
    default:
      return Settings2;
  }
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full p-1 transition ${checked ? "bg-brand-gold/20" : "bg-white/10"}`}
    >
      <span className={`block h-5 w-5 rounded-full transition ${checked ? "translate-x-5 bg-brand-gold" : "translate-x-0 bg-white/80"}`} />
    </button>
  );
}

export function SettingsPageClient() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [draft, setDraft] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await settingsApi.get();
      setSettings(response);
      setDraft(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load settings.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function saveSettings() {
    if (!draft) return;
    setIsSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await settingsApi.update(draft);
      setSettings(response);
      setDraft(response);
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageContainer
      eyebrow="Workspace control"
      title="Premium settings console"
      description="Elegant configuration surfaces for workspace identity, model behavior, automation rules, notifications, and security posture."
      actions={
        <button
          type="button"
          onClick={() => void saveSettings()}
          disabled={!draft || isSaving}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-gold px-4 py-3 text-sm font-medium text-background disabled:opacity-70"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save settings"}
        </button>
      }
    >
      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <ShimmerCard className="h-[420px] rounded-[30px]" />
            <ShimmerCard className="h-[420px] rounded-[30px]" />
            <ShimmerCard className="h-[420px] rounded-[30px]" />
            <ShimmerCard className="h-[420px] rounded-[30px]" />
          </div>
        </div>
      ) : error && !draft ? (
        <ErrorState title="Settings unavailable" message={error} onRetry={() => void loadSettings()} />
      ) : !draft ? (
        <EmptyState title="Settings unavailable" message="No settings payload was returned by the backend." onAction={() => void loadSettings()} actionLabel="Refresh" />
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            {[
              {
                id: "workspace",
                title: "Workspace settings",
                description: "Core workspace identity and operating defaults for the Aurevia console.",
                fields: [
                  {
                    label: "Workspace name",
                    hint: "Shown across admin surfaces and exported briefs.",
                    node: (
                      <input
                        value={draft.workspace.workspace_name}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, workspace: { ...current.workspace, workspace_name: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Primary market",
                    hint: "Used for formatting, timezone, and reporting assumptions.",
                    node: (
                      <input
                        value={draft.workspace.primary_market}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, workspace: { ...current.workspace, primary_market: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Brand tone",
                    hint: "Shared direction for premium reply style and admin copy.",
                    node: (
                      <textarea
                        value={draft.workspace.brand_tone}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, workspace: { ...current.workspace, brand_tone: event.target.value } }
                              : current,
                          )
                        }
                        rows={3}
                        className="mt-4 w-full rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                ],
              },
              {
                id: "ai",
                title: "AI model settings",
                description: "Controls for orchestration, retrieval, and reply generation behavior.",
                fields: [
                  {
                    label: "Primary model",
                    hint: "Main orchestration and reply model.",
                    node: (
                      <input
                        value={draft.ai.primary_model}
                        onChange={(event) =>
                          setDraft((current) => (current ? { ...current, ai: { ...current.ai, primary_model: event.target.value } } : current))
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Confidence threshold",
                    hint: "Below this, escalation logic becomes more aggressive.",
                    node: (
                      <input
                        type="number"
                        step="0.01"
                        value={draft.ai.confidence_threshold}
                        onChange={(event) =>
                          setDraft((current) => (current ? { ...current, ai: { ...current.ai, confidence_threshold: Number(event.target.value) } } : current))
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Temperature",
                    hint: "Balances consistency and response creativity.",
                    node: (
                      <input
                        type="number"
                        step="0.1"
                        value={draft.ai.temperature}
                        onChange={(event) =>
                          setDraft((current) => (current ? { ...current, ai: { ...current.ai, temperature: Number(event.target.value) } } : current))
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                ],
              },
              {
                id: "automation",
                title: "Automation settings",
                description: "Cadence and safety controls for follow-up sequences and task routing.",
                fields: [
                  {
                    label: "Auto follow-ups",
                    hint: "Allow AI to schedule nurture sequences automatically.",
                    node: (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-content-primary">{draft.automation.auto_follow_ups ? "Enabled" : "Disabled"}</span>
                        <Toggle
                          checked={draft.automation.auto_follow_ups}
                          onChange={() =>
                            setDraft((current) =>
                              current
                                ? { ...current, automation: { ...current.automation, auto_follow_ups: !current.automation.auto_follow_ups } }
                                : current,
                            )
                          }
                        />
                      </div>
                    ),
                  },
                  {
                    label: "Escalation guardrails",
                    hint: "Prioritize human takeover on urgency, sentiment, or complaint signals.",
                    node: (
                      <input
                        value={draft.automation.escalation_guardrails}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, automation: { ...current.automation, escalation_guardrails: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Follow-up delay hours",
                    hint: "Default interval used when automation schedules a next touchpoint.",
                    node: (
                      <input
                        type="number"
                        value={draft.automation.follow_up_delay_hours}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, automation: { ...current.automation, follow_up_delay_hours: Number(event.target.value) } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                ],
              },
              {
                id: "notifications",
                title: "Notification preferences",
                description: "Control how the ops team is alerted for risk and priority events.",
                fields: [
                  {
                    label: "Priority alerts",
                    hint: "Send alerts for critical escalations and SLA risk.",
                    node: (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-content-primary">{draft.notifications.priority_alerts ? "Enabled" : "Disabled"}</span>
                        <Toggle
                          checked={draft.notifications.priority_alerts}
                          onChange={() =>
                            setDraft((current) =>
                              current
                                ? { ...current, notifications: { ...current.notifications, priority_alerts: !current.notifications.priority_alerts } }
                                : current,
                            )
                          }
                        />
                      </div>
                    ),
                  },
                  {
                    label: "Daily summary",
                    hint: "Executive performance digest delivery time.",
                    node: (
                      <input
                        value={draft.notifications.daily_summary_time}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, notifications: { ...current.notifications, daily_summary_time: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Digest email",
                    hint: "Ops inbox for reporting and platform alerts.",
                    node: (
                      <input
                        value={draft.notifications.digest_email}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, notifications: { ...current.notifications, digest_email: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                ],
              },
              {
                id: "security",
                title: "Security and access",
                description: "Placeholder controls for authentication, permissions, and audit policies.",
                fields: [
                  {
                    label: "Admin access policy",
                    hint: "Reserved for role and permission mapping in the next security pass.",
                    node: (
                      <input
                        value={draft.security.admin_access_policy}
                        onChange={(event) =>
                          setDraft((current) =>
                            current
                              ? { ...current, security: { ...current.security, admin_access_policy: event.target.value } }
                              : current,
                          )
                        }
                        className="mt-4 h-12 w-full rounded-2xl border border-white/8 bg-white/5 px-4 text-sm text-content-primary outline-none"
                      />
                    ),
                  },
                  {
                    label: "Audit logging",
                    hint: "Track sensitive admin actions and system changes.",
                    node: (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-content-primary">{draft.security.audit_logging ? "Enabled" : "Disabled"}</span>
                        <Toggle
                          checked={draft.security.audit_logging}
                          onChange={() =>
                            setDraft((current) =>
                              current
                                ? { ...current, security: { ...current.security, audit_logging: !current.security.audit_logging } }
                                : current,
                            )
                          }
                        />
                      </div>
                    ),
                  },
                  {
                    label: "MFA required",
                    hint: "Reserved for stronger production access posture controls.",
                    node: (
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm font-medium text-content-primary">{draft.security.mfa_required ? "Enabled" : "Disabled"}</span>
                        <Toggle
                          checked={draft.security.mfa_required}
                          onChange={() =>
                            setDraft((current) =>
                              current
                                ? { ...current, security: { ...current.security, mfa_required: !current.security.mfa_required } }
                                : current,
                            )
                          }
                        />
                      </div>
                    ),
                  },
                ],
              },
            ].map((section) => {
              const Icon = iconFor(section.id);

              return (
                <article
                  key={section.id}
                  className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="label-caps text-brand-gold/80">{section.title}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">{section.title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-content-secondary">{section.description}</p>

                  <div className="mt-6 space-y-4">
                    {section.fields.map((field) => (
                      <div key={field.label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                        <p className="text-sm font-medium text-content-primary">{field.label}</p>
                        <p className="mt-1 text-sm text-content-secondary">{field.hint}</p>
                        {field.node}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </section>

          {(success || error) && draft ? (
            <div className={`rounded-[24px] border p-4 ${error ? "border-status-red/20 bg-status-red/10" : "border-status-green/20 bg-status-green/10"}`}>
              <p className="text-sm text-content-primary">{error ?? success}</p>
            </div>
          ) : null}

          <section className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">Future controls</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">Additional admin controls</h3>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Access management</p>
                <p className="mt-2 text-sm text-content-secondary">Reserved for team members, roles, and tenant-safe permission controls.</p>
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Audit workflow</p>
                <p className="mt-2 text-sm text-content-secondary">Placeholder for activity logs, approvals, and system change visibility.</p>
              </div>
              <div className="rounded-[24px] border border-dashed border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-content-primary">Brand governance</p>
                <p className="mt-2 text-sm text-content-secondary">Future controls for tone rules, disclaimers, and response style policies.</p>
              </div>
            </div>
          </section>
        </>
      )}
    </PageContainer>
  );
}
