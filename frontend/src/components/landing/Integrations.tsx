const CHANNELS = [
  {
    icon: "🌐",
    name: "Website",
    description: "Embed the Aurevia lead form on any website. Instant capture.",
    color: "border-status-blue/25 bg-status-blue-subtle",
    tag: "REST Webhook",
  },
  {
    icon: "📱",
    name: "WhatsApp",
    description: "Connect via Meta Cloud API. Real-time message events and replies.",
    color: "border-status-green/25 bg-status-green-subtle",
    tag: "Meta Cloud API",
  },
  {
    icon: "📧",
    name: "Email",
    description: "Parse inbound emails via IMAP. Auto-extract lead info and reply.",
    color: "border-status-purple/25 bg-status-purple-subtle",
    tag: "IMAP · OAuth",
  },
];

const TECH_STACK = [
  {
    name: "OpenAI",
    detail: "GPT-4o + text-embedding-3-small",
    color: "border-[#412991]/30 text-[#8B5CF6]",
    bg: "bg-[rgba(65,41,145,0.08)]",
  },
  {
    name: "Qdrant",
    detail: "Vector DB · Semantic Search",
    color: "border-[#DC244C]/30 text-[#DC244C]",
    bg: "bg-[rgba(220,36,76,0.06)]",
  },
  {
    name: "PostgreSQL",
    detail: "Primary data store · Async",
    color: "border-[#4169E1]/30 text-[#4169E1]",
    bg: "bg-[rgba(65,105,225,0.06)]",
  },
  {
    name: "FastAPI",
    detail: "Python 3.12 · Async · Pydantic v2",
    color: "border-[#009688]/30 text-[#009688]",
    bg: "bg-[rgba(0,150,136,0.06)]",
  },
  {
    name: "Next.js",
    detail: "14 · App Router · TypeScript",
    color: "border-content-muted/20 text-content-secondary",
    bg: "bg-surface-accent",
  },
  {
    name: "Docker",
    detail: "Compose · Production containers",
    color: "border-[#2496ED]/30 text-[#2496ED]",
    bg: "bg-[rgba(36,150,237,0.06)]",
  },
];

export default function Integrations() {
  return (
    <section id="integrations" className="relative py-28 bg-surface-base">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-surface-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6 space-y-20">

        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <p className="label-caps text-brand-gold">Integrations</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-content-primary leading-tight">
            Connect every channel.
            <br />
            <span className="text-gradient-gold">Own every lead.</span>
          </h2>
          <p className="text-content-secondary text-lg leading-relaxed">
            Plug in your existing channels in minutes. No complex setup.
            No middleware. Everything is built in.
          </p>
        </div>

        {/* ── Channels ── */}
        <div>
          <p className="label-caps text-content-muted mb-6 text-center">Lead Channels</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CHANNELS.map((ch) => (
              <div
                key={ch.name}
                className={`relative p-6 rounded-2xl border ${ch.color} flex flex-col gap-4 group hover:shadow-card transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ch.icon}</span>
                    <span className="text-content-primary font-semibold text-lg">{ch.name}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-surface-base border border-surface-border text-[10px] font-mono text-content-muted">
                    {ch.tag}
                  </span>
                </div>
                <p className="text-content-secondary text-sm leading-relaxed">
                  {ch.description}
                </p>
                <div className="flex items-center gap-2 mt-auto">
                  <span className="w-2 h-2 rounded-full bg-status-green" />
                  <span className="text-xs text-status-green font-medium">Ready to connect</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-6">
          <div className="flex-1 h-px bg-surface-border" />
          <span className="label-caps text-content-muted">Powered by</span>
          <div className="flex-1 h-px bg-surface-border" />
        </div>

        {/* ── Tech Stack ── */}
        <div>
          <p className="label-caps text-content-muted mb-6 text-center">Core Technology</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className={`p-4 rounded-xl border ${tech.color} ${tech.bg} flex flex-col gap-2 text-center`}
              >
                <p className="font-semibold text-sm">{tech.name}</p>
                <p className="text-[10px] text-content-muted leading-snug">{tech.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
