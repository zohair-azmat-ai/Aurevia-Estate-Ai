import Link from "next/link";

const LIVE_BACKEND_URL = "https://zohairazmat-aurevia-estate-ai-backend.hf.space";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Architecture", href: "#architecture" },
    { label: "Integrations", href: "#integrations" },
  ],
  Platform: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "API Docs", href: `${LIVE_BACKEND_URL}/docs`, external: true },
    { label: "Knowledge Base", href: "/knowledge" },
    { label: "Analytics", href: "/analytics" },
  ],
  Developer: [
    { label: "GitHub", href: "https://github.com", external: true },
    { label: "Architecture Docs", href: "/docs/architecture" },
    { label: "FastAPI Backend", href: LIVE_BACKEND_URL, external: true },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-surface-border bg-surface-base">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          <div className="space-y-5">
            <Link href="/" className="group flex w-fit items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-gold/25 bg-brand-gold-subtle">
                <span className="text-base font-bold text-brand-gold">A</span>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="text-[15px] font-semibold tracking-wide text-content-primary">
                  Aurevia
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-content-muted">
                  Estate AI
                </span>
              </div>
            </Link>

            <p className="max-w-[240px] text-sm leading-relaxed text-content-muted">
              AI-powered real estate lead automation. Capture. Qualify. Close.
            </p>

            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-status-green" />
              </span>
              <span className="text-xs text-content-muted">Live backend connected</span>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-content-muted">
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
                        className="text-sm text-content-secondary transition-colors duration-200 hover:text-content-primary"
                      >
                        {link.label} →
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-content-secondary transition-colors duration-200 hover:text-content-primary"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-surface-border pt-8 sm:flex-row">
          <p className="text-xs text-content-muted">© {currentYear} Aurevia Estate AI. MIT License.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-content-muted">
              Built with <span className="text-brand-gold">Next.js · FastAPI · OpenAI · Qdrant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
