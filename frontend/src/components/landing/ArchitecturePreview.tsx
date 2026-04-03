import { ArrowRight } from "lucide-react";

const PIPELINE_ROWS = [
  {
    label: "INBOUND",
    labelColor: "text-status-blue",
    nodes: [
      { name: "Website Form", color: "border-status-blue/30 bg-status-blue-subtle text-status-blue" },
      { name: "WhatsApp", color: "border-status-green/30 bg-status-green-subtle text-status-green" },
      { name: "Email Inbox", color: "border-status-purple/30 bg-status-purple-subtle text-status-purple" },
    ],
  },
];

interface PipelineNode {
  name: string;
  sub?: string;
  color: string;
  wide?: boolean;
}

const AI_PIPELINE: PipelineNode[] = [
  {
    name: "Intent Detection",
    sub: "GPT-4o · Classification",
    color: "border-status-purple/30 bg-status-purple-subtle text-status-purple",
    wide: false,
  },
  {
    name: "Structured Extraction",
    sub: "Function Calling · Budget · Location",
    color: "border-brand-gold/30 bg-brand-gold-subtle text-brand-gold",
    wide: false,
  },
  {
    name: "RAG Retrieval",
    sub: "Qdrant · text-embedding-3-small",
    color: "border-status-amber/30 bg-status-amber-subtle text-status-amber",
    wide: false,
  },
  {
    name: "GPT-4o Orchestrator",
    sub: "Reply Generation · Context-aware",
    color: "border-status-purple/40 bg-[rgba(124,58,237,0.12)] text-status-purple",
    wide: true,
  },
];

const ACTION_NODES = [
  { name: "CRM Update", color: "text-status-green", dot: "bg-status-green" },
  { name: "Follow-Up Schedule", color: "text-status-blue", dot: "bg-status-blue" },
  { name: "Human Escalation", color: "text-status-red", dot: "bg-status-red" },
  { name: "Analytics Log", color: "text-status-amber", dot: "bg-status-amber" },
];

const DATA_NODES = [
  {
    name: "PostgreSQL",
    sub: "Leads · Convos · Events",
    color: "border-status-blue/25 text-status-blue",
  },
  {
    name: "Qdrant",
    sub: "Vector Store · Knowledge",
    color: "border-status-red/25 text-status-red",
  },
];

export default function ArchitecturePreview() {
  return (
    <section id="architecture" className="relative py-28 bg-surface-base">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-surface-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
          <p className="label-caps text-brand-gold">System Architecture</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-content-primary leading-tight">
            Built for
            <br />
            <span className="text-gradient-gold">production scale</span>
          </h2>
          <p className="text-content-secondary text-lg leading-relaxed">
            A modular, event-driven AI pipeline designed for reliability,
            extensibility, and full observability.
          </p>
        </div>

        {/* ── Architecture Diagram ── */}
        <div className="relative rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden">

          {/* Header bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-border bg-surface-accent">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-status-red/60" />
              <span className="w-3 h-3 rounded-full bg-status-amber/60" />
              <span className="w-3 h-3 rounded-full bg-status-green/60" />
            </div>
            <span className="ml-2 text-xs text-content-muted font-mono">
              aurevia — AI orchestration pipeline
            </span>
            <div className="ml-auto flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
              <span className="text-xs text-status-green font-medium">Live</span>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-10">

            {/* ── Row 1: Inbound channels ── */}
            <div className="space-y-3">
              <p className="label-caps text-status-blue">⬇ Inbound Channels</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "🌐  Website Form", color: "border-status-blue/30 bg-status-blue-subtle text-status-blue" },
                  { name: "📱  WhatsApp Webhook", color: "border-status-green/30 bg-status-green-subtle text-status-green" },
                  { name: "📧  Email Inbox", color: "border-status-purple/30 bg-status-purple-subtle text-status-purple" },
                ].map((node) => (
                  <div
                    key={node.name}
                    className={`px-4 py-2.5 rounded-xl border ${node.color} text-sm font-medium`}
                  >
                    {node.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center gap-3">
              <div className="w-px h-8 bg-gradient-to-b from-status-blue/40 to-status-purple/40 ml-6" />
              <span className="text-xs text-content-muted font-mono bg-surface-accent border border-surface-border px-2.5 py-1 rounded-lg">
                Channel Ingestion · Normalize · Identify
              </span>
            </div>

            {/* ── Row 2: AI Intelligence ── */}
            <div className="space-y-3">
              <p className="label-caps text-status-purple">🤖 AI Intelligence Layer</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {AI_PIPELINE.map((node) => (
                  <div
                    key={node.name}
                    className={`px-4 py-3.5 rounded-xl border ${node.color} space-y-1`}
                  >
                    <p className="text-sm font-semibold leading-snug">{node.name}</p>
                    {node.sub && (
                      <p className="text-[11px] opacity-60 font-mono leading-snug">{node.sub}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="flex items-center gap-3">
              <div className="w-px h-8 bg-gradient-to-b from-status-purple/40 to-brand-gold/40 ml-6" />
              <span className="text-xs text-content-muted font-mono bg-surface-accent border border-surface-border px-2.5 py-1 rounded-lg">
                Reply generated → Dispatch actions
              </span>
            </div>

            {/* ── Row 3: Action Layer ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Actions */}
              <div className="space-y-3">
                <p className="label-caps text-brand-gold">⚡ Action Layer</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACTION_NODES.map((node) => (
                    <div
                      key={node.name}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-accent border border-surface-border"
                    >
                      <span className={`w-2 h-2 rounded-full ${node.dot} flex-shrink-0`} />
                      <span className={`text-sm font-medium ${node.color}`}>{node.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data stores */}
              <div className="space-y-3">
                <p className="label-caps text-status-green">🗄 Data Layer</p>
                <div className="space-y-2.5">
                  {DATA_NODES.map((node) => (
                    <div
                      key={node.name}
                      className={`flex items-start justify-between px-4 py-3 rounded-xl bg-surface-accent border ${node.color}/20`}
                    >
                      <div>
                        <p className={`text-sm font-semibold ${node.color}`}>{node.name}</p>
                        <p className="text-[11px] text-content-muted font-mono mt-0.5">{node.sub}</p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-surface-base border border-surface-border text-content-muted font-mono">
                        persistent
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Link to docs */}
        <div className="mt-8 text-center">
          <a
            href="/docs/architecture"
            className="inline-flex items-center gap-2 text-sm text-content-secondary hover:text-brand-gold transition-colors duration-200"
          >
            Full architecture documentation
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
