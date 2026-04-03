const TECH_ITEMS = [
  { name: "OpenAI GPT-4o", dot: "bg-status-purple" },
  { name: "WhatsApp Business API", dot: "bg-status-green" },
  { name: "Meta Cloud API", dot: "bg-status-blue" },
  { name: "Qdrant Vector DB", dot: "bg-status-red" },
  { name: "PostgreSQL 16", dot: "bg-status-blue" },
  { name: "FastAPI", dot: "bg-status-green" },
  { name: "Next.js 14", dot: "bg-content-muted" },
];

export default function TrustBar() {
  return (
    <section className="relative border-y border-surface-border bg-surface-elevated/50">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-content-muted whitespace-nowrap">
            Powered by
          </span>
          <div className="w-px h-4 bg-surface-border hidden sm:block" />
          {TECH_ITEMS.map((item, i) => (
            <div key={item.name} className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${item.dot} opacity-80`} />
                <span className="text-sm text-content-secondary font-medium whitespace-nowrap">
                  {item.name}
                </span>
              </div>
              {i < TECH_ITEMS.length - 1 && (
                <span className="text-surface-border hidden lg:block">·</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
