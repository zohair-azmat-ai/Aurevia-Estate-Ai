import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Database, Layers, Zap } from "lucide-react";

const STAT_PILLS = [
  { icon: Zap, label: "GPT-4o Powered" },
  { icon: Layers, label: "3 Channels" },
  { icon: Clock, label: "Real-time AI" },
  { icon: Database, label: "Auto CRM" },
];

export default function Hero() {
  return (
    <section className="luxury-bg relative flex min-h-screen items-center overflow-hidden pt-[68px]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.06)_0%,rgba(5,7,10,0.20)_32%,rgba(5,7,10,0.42)_100%)]" />
      <div className="absolute inset-x-[10%] top-[12%] h-[360px] rounded-full bg-[radial-gradient(circle,rgba(201,168,76,0.11)_0%,transparent_68%)] blur-3xl" />
      <div className="absolute inset-x-0 top-[18%] h-[420px] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-[360px] bg-[radial-gradient(circle_at_center_bottom,rgba(240,182,87,0.09),transparent_52%)]" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-[1.08fr_0.92fr] xl:gap-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-brand-gold/20 bg-[linear-gradient(180deg,rgba(201,168,76,0.16),rgba(201,168,76,0.08))] px-3.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-gold" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                AI-Powered Real Estate Platform
              </span>
            </div>

            <h1 className="text-[3.25rem] font-light leading-[1.02] tracking-[-0.045em] text-content-primary sm:text-[3.9rem] xl:text-[4.5rem]">
              Intelligent
              <br />
              Conversations.
              <br />
              <span className="text-gradient-gold">Qualified Leads.</span>
              <br />
              Closed Deals.
            </h1>

            <p className="max-w-[540px] text-lg leading-[1.8] text-content-secondary">
              Capture every lead from WhatsApp, email, and your website. Qualify them with GPT-4o
              in seconds. Follow up automatically. Close more deals without lifting a finger.
            </p>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-brand-gold/20 bg-[linear-gradient(180deg,#e0bf67_0%,#c9a84c_100%)] px-7 py-4 text-sm font-semibold text-surface-base transition-all duration-200 hover:brightness-105 hover:shadow-gold-sm"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.035] px-7 py-4 text-sm text-content-secondary transition-all duration-200 hover:border-brand-gold/20 hover:bg-white/[0.05] hover:text-content-primary"
              >
                View Architecture
                <ArrowRight className="h-4 w-4 opacity-40" />
              </a>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-3">
              {STAT_PILLS.map(({ icon: Icon, label }) => (
                <div key={label} className="glass flex items-center gap-2 rounded-[14px] px-3.5 py-2">
                  <Icon className="h-3.5 w-3.5 text-brand-gold" />
                  <span className="text-xs font-medium text-content-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-[32px] bg-brand-gold/8 blur-3xl" />

            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-3 shadow-[0_36px_100px_rgba(0,0,0,0.42)]">
              <div className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/6" />
              <div className="relative overflow-hidden rounded-[24px] border border-white/8">
                <Image
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85&auto=format&fit=crop"
                  alt="Luxury real estate property"
                  width={720}
                  height={520}
                  className="h-[460px] w-full object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090b11] via-[#090b11]/28 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-content-muted">
                        Featured Property
                      </p>
                      <p className="text-lg font-semibold leading-tight text-content-primary">
                        Palm Jumeirah Villa
                      </p>
                      <p className="mt-0.5 text-sm text-content-secondary">
                        Dubai, United Arab Emirates
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-brand-gold">AED 12.5M</p>
                      <p className="mt-0.5 text-xs text-content-muted">5 BR · 7,200 sqft</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="glass absolute -left-10 -top-5 z-10 w-[230px] rounded-2xl border border-surface-border p-4 shadow-card"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-status-green/20 bg-status-green-subtle">
                  <span className="text-base">📱</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight text-content-primary">
                    New lead captured
                  </p>
                  <p className="mt-0.5 text-[11px] text-content-muted">WhatsApp · 2 seconds ago</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-status-green" />
                    <span className="text-[11px] font-medium text-status-green">Intake complete</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="glass absolute -right-10 top-[38%] z-10 w-[248px] rounded-2xl border border-surface-border p-4 shadow-card"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-status-purple/20 bg-status-purple-subtle">
                  <span className="text-base">🤖</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight text-content-primary">
                    AI reply generated
                  </p>
                  <p className="mt-0.5 text-[11px] text-content-muted">GPT-4o · 1.2s response time</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="rounded-md border border-status-purple/15 bg-status-purple-subtle px-2 py-0.5 text-[10px] font-semibold text-status-purple">
                      Intent: Viewing · 94%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="glass absolute -bottom-5 -left-8 z-10 w-[226px] rounded-2xl border border-surface-border p-4 shadow-card"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-brand-gold/20 bg-brand-gold-subtle">
                  <span className="text-base">✓</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold leading-tight text-content-primary">
                    Lead qualified
                  </p>
                  <p className="mt-0.5 text-[11px] text-content-muted">AED 2.5M · Dubai Marina</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-gold" />
                    <span className="text-[11px] font-medium text-brand-gold">
                      CRM updated automatically
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 opacity-40">
        <span className="text-[11px] uppercase tracking-widest text-content-muted">Explore</span>
        <div className="h-10 w-px bg-gradient-to-b from-surface-border to-transparent" />
      </div>
    </section>
  );
}
