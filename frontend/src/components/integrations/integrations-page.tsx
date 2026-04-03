"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Database,
  Link2,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TestTube2,
} from "lucide-react";
import { EmptyState, ErrorState, ShimmerCard } from "@/components/ui/data-states";
import { PageContainer } from "@/components/dashboard/page-shell";
import { integrationsApi } from "@/lib/api";
import type { IntegrationProvider } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";

function statusTone(status: IntegrationProvider["status"]) {
  switch (status) {
    case "connected":
      return "bg-status-green-subtle text-status-green";
    case "warning":
      return "bg-status-amber-subtle text-status-amber";
    default:
      return "bg-status-red-subtle text-status-red";
  }
}

function providerIcon(name: string) {
  return name === "PostgreSQL" || name === "Qdrant" ? Database : Link2;
}

const initialSendTargets = {
  whatsapp: { to: "", message: "Aurevia WhatsApp connector health check." },
  email: { to: "", subject: "Aurevia connector test", message: "Aurevia email connector health check." },
};

export function IntegrationsPageClient() {
  const [items, setItems] = useState<IntegrationProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyProvider, setBusyProvider] = useState<string | null>(null);
  const [sendTargets, setSendTargets] = useState(initialSendTargets);

  const loadIntegrations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await integrationsApi.list();
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load integrations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIntegrations();
  }, [loadIntegrations]);

  const keyMetrics = useMemo(
    () => ({
      connected: items.filter((item) => item.status === "connected").length,
      degraded: items.filter((item) => item.health !== "healthy").length,
    }),
    [items],
  );

  async function runAction(provider: string, action: "test" | "sync") {
    setBusyProvider(`${provider}:${action}`);
    setActionMessage(null);
    try {
      const result =
        action === "test"
          ? await integrationsApi.test(provider)
          : await integrationsApi.sync(provider);
      setActionMessage(result.message);
      await loadIntegrations();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Integration action failed.");
    } finally {
      setBusyProvider(null);
    }
  }

  async function runTestSend(provider: "whatsapp" | "email") {
    setBusyProvider(`${provider}:test-send`);
    setActionMessage(null);
    try {
      const payload = sendTargets[provider];
      const result =
        provider === "whatsapp"
          ? await integrationsApi.testSendWhatsapp(payload)
          : await integrationsApi.testSendEmail(payload);
      setActionMessage(result.message);
      await loadIntegrations();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Test send failed.");
    } finally {
      setBusyProvider(null);
    }
  }

  return (
    <PageContainer
      eyebrow="Connected systems"
      title="Integrations control room"
      description="A polished technical operations surface for connection health, service posture, and sync actions across the Aurevia stack."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Connected</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{keyMetrics.connected}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Degraded</p>
            <p className="mt-1 text-lg font-semibold text-content-primary">{keyMetrics.degraded}</p>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid gap-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ShimmerCard className="h-[360px] rounded-[30px]" />
            <ShimmerCard className="h-[360px] rounded-[30px]" />
            <ShimmerCard className="h-[360px] rounded-[30px]" />
          </div>
          <ShimmerCard className="h-[280px] rounded-[30px]" />
        </div>
      ) : error ? (
        <ErrorState title="Integrations unavailable" message={error} onRetry={() => void loadIntegrations()} />
      ) : items.length === 0 ? (
        <EmptyState title="No integrations found" message="The backend did not return any integration metadata yet." onAction={() => void loadIntegrations()} actionLabel="Refresh" />
      ) : (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const Icon = providerIcon(item.display_name);
              const metadata = Object.entries(item.config_metadata ?? {});

              return (
                <article
                  key={item.provider}
                  className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-content-primary">{item.display_name}</h3>
                  <p className="mt-2 text-sm text-content-secondary">{item.notes ?? "No additional notes available."}</p>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Health</p>
                      <p className="mt-2 text-sm font-medium capitalize text-content-primary">{item.health}</p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Last checked</p>
                      <p className="mt-2 text-sm font-medium text-content-primary">
                        {item.last_checked_at ? formatRelativeTime(item.last_checked_at) : "Not checked yet"}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-white/8 bg-black/20 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-content-muted">Config metadata</p>
                      <div className="mt-3 grid gap-2">
                        {metadata.slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between gap-3 text-sm">
                            <span className="capitalize text-content-secondary">{key.replaceAll("_", " ")}</span>
                            <span className="font-medium text-content-primary">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void runAction(item.provider, "sync")}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 text-brand-gold ${busyProvider === `${item.provider}:sync` ? "animate-spin" : ""}`} />
                      Sync
                    </button>
                    <button
                      type="button"
                      onClick={() => void runAction(item.provider, "test")}
                      className="inline-flex items-center gap-1 rounded-full border border-brand-gold/15 bg-brand-gold/10 px-3 py-1 text-xs font-medium text-brand-gold"
                    >
                      <TestTube2 className="h-3.5 w-3.5" />
                      Test
                    </button>
                    <button
                      type="button"
                      onClick={() => void runAction(item.provider, "sync")}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-content-primary"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-brand-gold" />
                      Reconnect
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.14),rgba(255,255,255,0.02)_38%,rgba(255,255,255,0.01)_100%)] p-6 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">Connector flows</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">Outbound transport tests</h3>
              </div>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                <p className="text-lg font-medium text-content-primary">WhatsApp test send</p>
                <p className="mt-2 text-sm text-content-secondary">Use the safe provider placeholder to validate the channel wiring end-to-end.</p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={sendTargets.whatsapp.to}
                    onChange={(event) =>
                      setSendTargets((current) => ({
                        ...current,
                        whatsapp: { ...current.whatsapp, to: event.target.value },
                      }))
                    }
                    placeholder="Recipient number"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-content-primary outline-none"
                  />
                  <textarea
                    value={sendTargets.whatsapp.message}
                    onChange={(event) =>
                      setSendTargets((current) => ({
                        ...current,
                        whatsapp: { ...current.whatsapp, message: event.target.value },
                      }))
                    }
                    rows={4}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void runTestSend("whatsapp")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-gold px-4 text-sm font-medium text-background"
                  >
                    <Send className="h-4 w-4" />
                    Test WhatsApp
                  </button>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                <p className="text-lg font-medium text-content-primary">Email test send</p>
                <p className="mt-2 text-sm text-content-secondary">Validate outbound email transport while keeping secrets safely masked in the backend.</p>
                <div className="mt-4 grid gap-3">
                  <input
                    value={sendTargets.email.to}
                    onChange={(event) =>
                      setSendTargets((current) => ({
                        ...current,
                        email: { ...current.email, to: event.target.value },
                      }))
                    }
                    placeholder="Recipient email"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-content-primary outline-none"
                  />
                  <input
                    value={sendTargets.email.subject}
                    onChange={(event) =>
                      setSendTargets((current) => ({
                        ...current,
                        email: { ...current.email, subject: event.target.value },
                      }))
                    }
                    placeholder="Subject"
                    className="h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-content-primary outline-none"
                  />
                  <textarea
                    value={sendTargets.email.message}
                    onChange={(event) =>
                      setSendTargets((current) => ({
                        ...current,
                        email: { ...current.email, message: event.target.value },
                      }))
                    }
                    rows={3}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-content-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void runTestSend("email")}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand-gold px-4 text-sm font-medium text-background"
                  >
                    <Send className="h-4 w-4" />
                    Test Email
                  </button>
                </div>
              </div>
            </div>

            {actionMessage ? (
              <div className="mt-5 rounded-[22px] border border-white/8 bg-black/20 p-4">
                <p className="text-sm text-content-secondary">{actionMessage}</p>
              </div>
            ) : null}
          </section>
        </>
      )}
    </PageContainer>
  );
}
