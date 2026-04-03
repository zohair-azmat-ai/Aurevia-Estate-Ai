import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "Integrations", href: "#integrations" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "API Docs", href: "http://localhost:8000/docs", external: true },
    { label: "Knowledge Base", href: "/knowledge" },
    { label: "Analytics", href: "/analytics" },
  ],
  Developer: [
    { label: "GitHub", href: "https://github.com", external: true },
    { label: "Architecture Docs", href: "/docs/architecture" },
    { label: "FastAPI Backend", href: "http://localhost:8000", external: true },
    { label: "Qdrant UI", href: "http://localhost:6333/dashboard", external: true },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-base border-t border-surface-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

          {/* ── Brand Column ── */}
          <div className="space-y-5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-brand-gold-subtle border border-brand-gold/25 flex items-center justify-center">
                <span className="text-brand-gold font-bold text-base">A</span>
              </div>
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-content-primary font-semibold tracking-wide text-[15px]">
                  Aurevia
                </span>
                <span className="text-[9px] font-semibold tracking-[0.2em] text-content-muted uppercase">
                  Estate AI
                </span>
              </div>
            </Link>

            {/* Tagline */}
            <p className="text-content-muted text-sm leading-relaxed max-w-[240px]">
              AI-powered real estate lead automation. Capture. Qualify. Close.
            </p>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-green" />
              </span>
              <span className="text-xs text-content-muted">All systems operational</span>
            </div>
          </div>

          {/* ── Link Columns ── */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-5">
              <h4 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-content-muted">
                {section}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-content-secondary hover:text-content-primary transition-colors duration-200"
                      >
                        {link.label} ↗
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-content-secondary hover:text-content-primary transition-colors duration-200"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 pt-8 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-content-muted">
            © {currentYear} Aurevia Estate AI. MIT License.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-content-muted">
              Built with{" "}
              <span className="text-brand-gold">Next.js · FastAPI · OpenAI · Qdrant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
