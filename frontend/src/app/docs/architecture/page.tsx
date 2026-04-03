import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Database, Network, Sparkles, Workflow } from "lucide-react";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "System architecture for Aurevia Estate AI, covering inbound channels, AI intelligence, action orchestration, and data infrastructure.",
  openGraph: {
    url: "https://aurevia-estate-ai.vercel.app/docs/architecture",
    title: "Aurevia Estate AI Architecture",
    description:
      "Explore the inbound, intelligence, action, and data layers behind Aurevia Estate AI.",
    type: "article",
  },
  alternates: {
    canonical: "https://aurevia-estate-ai.vercel.app/docs/architecture",
  },
};

const inboundChannels = [
  {
    title: "Website Intake",
    description:
      "Captures direct property interest from landing pages, forms, and on-site chat flows.",
    accent: "border-status-blue/30 bg-status-blue-subtle text-status-blue",
  },
  {
    title: "WhatsApp",
    description:
      "Handles conversational demand from high-intent prospects who prefer fast mobile interaction.",
    accent: "border-status-green/30 bg-status-green-subtle text-status-green",
  },
  {
    title: "Email",
    description:
      "Processes slower, detail-rich inquiries and keeps them inside the same operating workflow.",
    accent: "border-status-purple/30 bg-status-purple-subtle text-status-purple",
  },
];

const intelligenceNodes = [
  "Intent detection and journey classification",
  "Entity extraction for budget, location, property type, and timing",
  "RAG retrieval against indexed brokerage knowledge",
  "LLM orchestration for grounded replies and next-action decisions",
];

const actionNodes = [
  "Property suggestion lookup",
  "Lead creation and enrichment",
  "Follow-up scheduling",
  "High-value escalation routing",
  "Analytics and operational logging",
];

const dataNodes = [
  {
    title: "PostgreSQL",
    description: "Operational CRM state for leads, conversations, events, and workflow records.",
  },
  {
    title: "Qdrant",
    description: "Vector knowledge index for retrieval-augmented answers and document grounding.",
  },
  {
    title: "Frontend Runtime",
    description: "Premium Next.js dashboard and landing surfaces, including demo-safe fallback mode.",
  },
];

const stackRows = [
  ["Frontend", "Next.js 14, App Router, TypeScript, Tailwind CSS"],
  ["Backend", "FastAPI, Pydantic, SQLAlchemy, Alembic"],
  ["AI", "OpenAI GPT-4o orchestration, embeddings, prompt-driven extraction"],
  ["Data", "PostgreSQL, Qdrant, portable SQLite support for selected deployments"],
  ["Deployment", "Vercel, Render, Railway, Hugging Face Space workflow"],
];

export default function ArchitectureDocumentationPage() {
  return (
    <div className="landing-luxury-bg relative min-h-screen overflow-hidden text-content-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px]"
        style={{
          background:
            "radial-gradient(ellipse 110% 100% at 50% -10%, rgba(214,174,83,0.18) 0%, rgba(201,168,76,0.08) 42%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 90% 14%, rgba(56,88,154,0.16), transparent 20%), radial-gradient(circle at 10% 84%, rgba(201,168,76,0.08), transparent 24%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 84% 84% at 50% 50%, transparent 48%, rgba(3,4,8,0.52) 100%)",
        }}
      />

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-20 pt-28">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-content-secondary transition-colors hover:border-brand-gold/20 hover:text-content-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to landing page
          </Link>
          <div className="rounded-full border border-brand-gold/20 bg-brand-gold-subtle px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
            Full architecture documentation
          </div>
        </div>

        <section className="glass relative overflow-hidden rounded-[32px] border border-white/10 px-8 py-10 shadow-[0_30px_100px_rgba(0,0,0,0.42)] sm:px-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-5">
              <p className="label-caps text-brand-gold">Aurevia System Blueprint</p>
              <h1 className="max-w-3xl text-4xl font-light leading-tight tracking-[-0.04em] text-content-primary sm:text-5xl">
                AI workflow architecture for a premium real estate demand engine.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-content-secondary sm:text-lg">
                This page maps how Aurevia receives inbound property demand, enriches it
                through AI and retrieval, executes workflow actions, and exposes the
                results through a premium operations command center.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Network className="mb-3 h-5 w-5 text-status-blue" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
                  Inbound Sources
                </p>
                <p className="mt-2 text-sm text-content-primary">Website, WhatsApp, Email</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Sparkles className="mb-3 h-5 w-5 text-brand-gold" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
                  Orchestration
                </p>
                <p className="mt-2 text-sm text-content-primary">Extraction, retrieval, replies</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Workflow className="mb-3 h-5 w-5 text-status-green" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
                  Action Layer
                </p>
                <p className="mt-2 text-sm text-content-primary">Lead capture, follow-up, routing</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <Database className="mb-3 h-5 w-5 text-status-purple" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-content-muted">
                  Data Layer
                </p>
                <p className="mt-2 text-sm text-content-primary">PostgreSQL and Qdrant state</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass rounded-[28px] border border-white/10 p-7">
            <p className="label-caps text-status-blue">AI Workflow Overview</p>
            <div className="mt-5 space-y-4">
              {[
                "Inbound messages are normalized into a consistent event shape.",
                "The AI layer extracts intent, budget, location, and property preferences.",
                "The orchestrator chooses retrieval and action tools based on user context.",
                "Suggested properties, insights, follow-ups, and escalations are written back to the operating system.",
              ].map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-gold-subtle text-xs font-semibold text-brand-gold">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-7 text-content-secondary">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-[28px] border border-white/10 p-7">
            <p className="label-caps text-status-green">Inbound Channels</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {inboundChannels.map((channel) => (
                <div
                  key={channel.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div
                    className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${channel.accent}`}
                  >
                    {channel.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-content-secondary">
                    {channel.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="glass rounded-[28px] border border-white/10 p-7">
            <p className="label-caps text-status-purple">AI Intelligence Layer</p>
            <ul className="mt-5 space-y-3">
              {intelligenceNodes.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-sm leading-7 text-content-secondary"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-[28px] border border-white/10 p-7">
            <p className="label-caps text-brand-gold">Action Layer</p>
            <ul className="mt-5 space-y-3">
              {actionNodes.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4 text-sm text-content-secondary"
                >
                  <span className="h-2 w-2 rounded-full bg-brand-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-[28px] border border-white/10 p-7">
            <p className="label-caps text-status-amber">Data Layer</p>
            <div className="mt-5 space-y-4">
              {dataNodes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-content-primary">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-content-secondary">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-[28px] border border-white/10 p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label-caps text-brand-gold">Stack Summary</p>
              <h2 className="mt-3 text-2xl font-light tracking-[-0.03em] text-content-primary">
                Production-shaped foundations across interface, API, AI, and data.
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[16px] border border-brand-gold/20 bg-[linear-gradient(180deg,#e0bf67_0%,#c9a84c_100%)] px-5 py-3 text-sm font-semibold text-surface-base transition-all duration-200 hover:brightness-105 hover:shadow-gold-sm"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[22px] border border-white/10">
            <table className="w-full border-collapse text-left">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
                    Layer
                  </th>
                  <th className="px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
                    Summary
                  </th>
                </tr>
              </thead>
              <tbody>
                {stackRows.map(([label, value]) => (
                  <tr key={label} className="border-t border-white/8">
                    <td className="px-5 py-4 text-sm font-semibold text-content-primary">{label}</td>
                    <td className="px-5 py-4 text-sm text-content-secondary">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
