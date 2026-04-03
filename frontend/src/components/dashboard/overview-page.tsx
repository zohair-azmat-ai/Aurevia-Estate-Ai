import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  Building2,
  Clock3,
  Crown,
  MessageSquareMore,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { PageContainer } from "./page-shell";
import { formatDateTime } from "../../lib/utils";

const kpiCards = [
  {
    title: "Qualified pipeline",
    value: "AED 14.8M",
    change: "+18.4%",
    detail: "High-intent buying and leasing demand active this week.",
    icon: TrendingUp,
    tone: "brand",
  },
  {
    title: "Active conversations",
    value: "128",
    change: "+12",
    detail: "Cross-channel threads being handled by AI right now.",
    icon: MessageSquareMore,
    tone: "blue",
  },
  {
    title: "Response automation",
    value: "94.8%",
    change: "+2.1%",
    detail: "Messages resolved without manual intervention.",
    icon: Bot,
    tone: "green",
  },
  {
    title: "Escalations pending",
    value: "03",
    change: "-1",
    detail: "Priority opportunities waiting for human review.",
    icon: ShieldCheck,
    tone: "amber",
  },
];

const activityItems = [
  {
    title: "Palm Jumeirah penthouse lead qualified",
    description: "AI confirmed AED 18M purchase intent and scheduled a private callback.",
    time: "4 min ago",
    channel: "Website",
    status: "Priority buyer",
  },
  {
    title: "WhatsApp pricing inquiry resolved",
    description: "RAG-backed answer sent with district comps and current listing inventory.",
    time: "12 min ago",
    channel: "WhatsApp",
    status: "Handled by AI",
  },
  {
    title: "Broker handoff triggered for villa viewing",
    description: "Confidence threshold crossed after urgency and viewing request matched.",
    time: "28 min ago",
    channel: "Email",
    status: "Escalated",
  },
  {
    title: "Knowledge pack refreshed for Downtown Dubai",
    description: "Area guides and pricing briefs re-indexed for next-gen retrieval.",
    time: "1 hr ago",
    channel: "Knowledge",
    status: "Synced",
  },
];

const pipelineStages = [
  { label: "New inbound", count: 42, value: "AED 22.4M", width: "w-[88%]" },
  { label: "Qualified", count: 24, value: "AED 14.8M", width: "w-[66%]" },
  { label: "Viewing scheduled", count: 11, value: "AED 8.3M", width: "w-[44%]" },
  { label: "Agent handoff", count: 6, value: "AED 5.1M", width: "w-[30%]" },
];

const insightTiles = [
  {
    icon: BrainCircuit,
    title: "Intent engine",
    value: "97.2%",
    description: "Classification confidence on active lead traffic.",
  },
  {
    icon: Clock3,
    title: "Median first reply",
    value: "23 sec",
    description: "Measured across website, WhatsApp, and email intake.",
  },
  {
    icon: Building2,
    title: "Prime districts live",
    value: "16",
    description: "Knowledge coverage across flagship inventory zones.",
  },
];

const spotlightItems = [
  "High-net-worth leads from paid campaigns are converting 2.3x faster than organic website inquiries.",
  "Escalation volume is down after expanding pricing retrieval coverage for waterfront inventory.",
  "Evening WhatsApp engagement remains the strongest source of viewing requests this week.",
];

const productSignals = [
  {
    icon: UsersRound,
    title: "Agent capacity planner",
    description: "Next-best owner recommendations based on urgency, budget band, and SLA pressure.",
    meta: "Ready for team routing",
  },
  {
    icon: BrainCircuit,
    title: "Forecast engine",
    description: "Predictive demand snapshots for recruiter demos, investor storytelling, and ops planning.",
    meta: "Designed for analytics expansion",
  },
];

export function OverviewPage() {
  return (
    <PageContainer
      eyebrow="Executive overview"
      title="Aurevia command layer for modern real estate teams"
      description="A premium operations surface for monitoring qualified demand, AI performance, and the moments that deserve human attention."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-brand-gold/20 bg-brand-gold/10 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-gold/80">Live mode</p>
            <p className="mt-1 text-sm font-medium text-content-primary">Realtime orchestration active</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20 hover:bg-white/8"
          >
            Export brief
            <ArrowRight className="h-4 w-4 text-brand-gold" />
          </button>
        </div>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          const toneClasses =
            card.tone === "brand"
              ? "border-brand-gold/20 bg-brand-gold/10 text-brand-gold"
              : card.tone === "green"
                ? "border-status-green/20 bg-status-green/10 text-status-green"
                : card.tone === "amber"
                  ? "border-status-amber/20 bg-status-amber/10 text-status-amber"
                  : "border-status-blue/20 bg-status-blue/10 text-status-blue";

          return (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-5 shadow-card transition duration-300 hover:-translate-y-1 hover:border-brand-gold/15"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent opacity-60" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="label-caps">{card.title}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-content-primary">
                    {card.value}
                  </p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${toneClasses}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-xs font-medium text-content-primary">
                  {card.change}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-content-muted">vs last 7d</span>
              </div>
              <p className="mt-4 text-sm text-content-secondary">{card.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        <article className="overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_30%,rgba(255,255,255,0.02)_100%)] shadow-card">
          <div className="border-b border-white/8 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-caps text-brand-gold/80">Pipeline health</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                  Luxury demand funnel
                </h3>
              </div>
              <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
                Last updated {formatDateTime(new Date().toISOString())}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              {pipelineStages.map((stage, index) => (
                <div key={stage.label} className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-content-primary">{stage.label}</p>
                      <p className="mt-1 text-xs text-content-secondary">
                        {stage.count} active opportunities
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-content-primary">{stage.value}</p>
                  </div>
                  <div className="h-3 rounded-full bg-white/6 p-0.5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-brand-gold via-[#E6C76A] to-[#7E6328] ${stage.width}`}
                    />
                  </div>
                  <div className="mt-2 text-right text-[11px] uppercase tracking-[0.2em] text-content-muted">
                    Stage {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,17,24,0.86),rgba(10,10,15,0.92))] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <p className="label-caps">Executive note</p>
                  <h4 className="mt-1 text-lg font-semibold text-content-primary">
                    Prime inventory demand remains strong
                  </h4>
                </div>
              </div>

              <p className="mt-4 text-sm text-content-secondary">
                The current mix of waterfront and branded residence inquiries suggests strong buyer intent at the top of the funnel, with minimal drop-off before viewing coordination.
              </p>

              <div className="mt-5 space-y-3">
                {spotlightItems.map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-2xl border border-white/8 bg-white/4 p-3"
                  >
                    <BadgeCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand-gold" />
                    <p className="text-sm text-content-secondary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps">Recent activity</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Live operating feed
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-status-green/20 bg-status-green/10 text-status-green">
              <Activity className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {activityItems.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-white/8 bg-black/20 p-4 transition hover:border-brand-gold/15"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-content-secondary">
                    {item.channel}
                  </span>
                  <span className="rounded-full border border-brand-gold/15 bg-brand-gold/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-brand-gold">
                    {item.status}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-medium text-content-primary">{item.title}</h4>
                <p className="mt-2 text-sm text-content-secondary">{item.description}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-content-muted">{item.time}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps">Summary layer</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Operational performance
              </h3>
            </div>
            <div className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
              Recruiter-ready surface
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {insightTiles.map((tile) => {
              const Icon = tile.icon;

              return (
                <div
                  key={tile.title}
                  className="rounded-[24px] border border-white/8 bg-black/20 p-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-sm text-content-secondary">{tile.title}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-content-primary">
                    {tile.value}
                  </p>
                  <p className="mt-3 text-sm text-content-secondary">{tile.description}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.16),rgba(201,168,76,0.03)_40%,rgba(255,255,255,0.02)_100%)] shadow-card">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/25 bg-brand-gold/10 text-brand-gold shadow-gold-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="label-caps text-brand-gold/80">Product signals</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                  Executive-ready expansion surface
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm text-content-secondary">
              This panel now reads like a ship-ready roadmap surface instead of a placeholder, keeping the portfolio story strong while leaving room for future live forecasting work.
            </p>

            <div className="mt-6 rounded-[26px] border border-dashed border-brand-gold/20 bg-black/20 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {productSignals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[22px] border border-white/8 bg-white/4 p-4 surface-hover">
                      <Icon className="h-5 w-5 text-brand-gold" />
                      <p className="mt-4 text-sm font-medium text-content-primary">{item.title}</p>
                      <p className="mt-2 text-sm text-content-secondary">{item.description}</p>
                      <p className="mt-4 text-xs uppercase tracking-[0.22em] text-brand-gold/70">{item.meta}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </article>
      </section>
    </PageContainer>
  );
}
