import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-28 bg-surface-elevated border-t border-surface-border overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(201,168,76,0.07)_0%,transparent_70%)]" />
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner glows */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-status-purple/5 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 text-center space-y-10">

        {/* Label */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-brand-gold/20 bg-brand-gold-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="text-[11px] font-semibold tracking-[0.16em] text-brand-gold uppercase">
            Ready to automate
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-content-primary leading-tight">
            Stop losing leads to
            <br />
            <span className="text-gradient-gold">slow response times.</span>
          </h2>
          <p className="text-content-secondary text-xl leading-relaxed max-w-2xl mx-auto">
            Aurevia responds in under 2 seconds — 24/7. Every lead captured.
            Every opportunity followed up. Every deal tracked.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-brand-gold text-surface-base font-semibold text-base hover:bg-brand-gold-muted transition-all duration-200 shadow-gold hover:shadow-gold-sm min-w-[200px] justify-center"
          >
            Open Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl border border-surface-border text-content-secondary text-base hover:border-brand-gold/30 hover:text-content-primary hover:bg-surface-accent transition-all duration-200 min-w-[200px] justify-center"
          >
            <Github className="w-5 h-5" />
            View on GitHub
          </a>
        </div>

        {/* Trust line */}
        <p className="text-content-muted text-sm">
          Open source · MIT License · Built for portfolio &amp; production
        </p>
      </div>
    </section>
  );
}
