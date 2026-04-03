import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap, Layers, Clock, Database } from "lucide-react";

const STAT_PILLS = [
  { icon: Zap, label: "GPT-4o Powered" },
  { icon: Layers, label: "3 Channels" },
  { icon: Clock, label: "Real-time AI" },
  { icon: Database, label: "Auto CRM" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-[68px]">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-surface-base" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(201,168,76,0.11)_0%,transparent_65%)]" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(124,58,237,0.04)_0%,transparent_70%)]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.04)_0%,transparent_70%)]" />

      {/* ── Grid pattern overlay ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 w-full py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 xl:gap-24 items-center">

          {/* ── Left: Content ── */}
          <div className="space-y-8">

            {/* Label badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-brand-gold/20 bg-brand-gold-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold tracking-[0.16em] text-brand-gold uppercase">
                AI-Powered Real Estate Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[3.25rem] sm:text-[3.75rem] xl:text-[4.25rem] font-light tracking-[-0.03em] text-content-primary leading-[1.06]">
              Intelligent
              <br />
              Conversations.
              <br />
              <span className="text-gradient-gold">Qualified Leads.</span>
              <br />
              Closed Deals.
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-content-secondary leading-[1.75] max-w-[500px]">
              Capture every lead from WhatsApp, email, and your website.
              Qualify them with GPT-4o in seconds. Follow up automatically.
              Close more deals without lifting a finger.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-brand-gold text-surface-base font-semibold text-sm hover:bg-brand-gold-muted transition-all duration-200 shadow-gold hover:shadow-gold-sm"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#architecture"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border border-surface-border text-content-secondary text-sm hover:border-brand-gold/30 hover:text-content-primary hover:bg-surface-elevated transition-all duration-200"
              >
                View Architecture
                <ArrowRight className="w-4 h-4 opacity-40" />
              </a>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-2.5 pt-3">
              {STAT_PILLS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-elevated border border-surface-border"
                >
                  <Icon className="w-3.5 h-3.5 text-brand-gold" />
                  <span className="text-xs text-content-secondary font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Property Visual ── */}
          <div className="relative hidden lg:block">

            {/* Glow behind card */}
            <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl bg-brand-gold/5 blur-2xl" />

            {/* Main property card */}
            <div className="relative rounded-2xl overflow-hidden border border-surface-border shadow-card-hover">
              <Image
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=85&auto=format&fit=crop"
                alt="Luxury real estate property"
                width={720}
                height={520}
                className="w-full h-[460px] object-cover"
                priority
              />
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent" />
              {/* Property info strip */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-content-muted mb-1">
                      Featured Property
                    </p>
                    <p className="text-content-primary font-semibold text-lg leading-tight">
                      Palm Jumeirah Villa
                    </p>
                    <p className="text-content-secondary text-sm mt-0.5">Dubai, United Arab Emirates</p>
                  </div>
                  <div className="text-right">
                    <p className="text-brand-gold font-semibold text-xl">AED 12.5M</p>
                    <p className="text-content-muted text-xs mt-0.5">5 BR · 7,200 sqft</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Floating Card: New lead ── */}
            <div
              className="absolute -top-5 -left-10 glass rounded-2xl p-4 w-[230px] shadow-card border border-surface-border animate-slide-up z-10"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-green-subtle border border-status-green/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📱</span>
                </div>
                <div className="min-w-0">
                  <p className="text-content-primary text-xs font-semibold leading-tight">
                    New lead captured
                  </p>
                  <p className="text-content-muted text-[11px] mt-0.5">WhatsApp · 2 seconds ago</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-green flex-shrink-0" />
                    <span className="text-status-green text-[11px] font-medium">
                      Intake complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Floating Card: AI reply ── */}
            <div
              className="absolute top-[38%] -right-10 glass rounded-2xl p-4 w-[248px] shadow-card border border-surface-border animate-slide-up z-10"
              style={{ animationDelay: "0.25s" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-status-purple-subtle border border-status-purple/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">🤖</span>
                </div>
                <div className="min-w-0">
                  <p className="text-content-primary text-xs font-semibold leading-tight">
                    AI reply generated
                  </p>
                  <p className="text-content-muted text-[11px] mt-0.5">GPT-4o · 1.2s response time</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-status-purple-subtle text-status-purple border border-status-purple/15">
                      Intent: Viewing · 94%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Floating Card: Lead qualified ── */}
            <div
              className="absolute -bottom-5 -left-8 glass rounded-2xl p-4 w-[226px] shadow-card border border-surface-border animate-slide-up z-10"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-gold-subtle border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">✅</span>
                </div>
                <div className="min-w-0">
                  <p className="text-content-primary text-xs font-semibold leading-tight">
                    Lead qualified
                  </p>
                  <p className="text-content-muted text-[11px] mt-0.5">AED 2.5M · Dubai Marina</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-gold flex-shrink-0" />
                    <span className="text-brand-gold text-[11px] font-medium">
                      CRM updated automatically
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 opacity-40">
        <span className="text-[11px] text-content-muted tracking-widest uppercase">Explore</span>
        <div className="w-px h-10 bg-gradient-to-b from-surface-border to-transparent" />
      </div>
    </section>
  );
}
