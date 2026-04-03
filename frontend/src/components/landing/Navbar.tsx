"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Architecture", href: "#architecture" },
  { label: "Integrations", href: "#integrations" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/8 bg-[linear-gradient(180deg,rgba(7,9,13,0.9),rgba(7,9,13,0.8))] backdrop-blur-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-[68px] flex items-center justify-between">

        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl bg-brand-gold-subtle border border-brand-gold/25 flex items-center justify-center group-hover:border-brand-gold/50 group-hover:shadow-gold-sm transition-all duration-300">
            <span className="text-brand-gold font-bold text-base tracking-tight">A</span>
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

        {/* ── Desktop Nav ── */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/6 bg-white/[0.03] px-2 py-1 backdrop-blur-xl">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-content-secondary transition-colors duration-200 hover:bg-white/[0.04] hover:text-content-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Desktop Right ── */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-brand-gold/12 bg-brand-gold/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-status-green" />
            </span>
            <span className="text-xs text-brand-gold/90">All systems operational</span>
          </div>
          <div className="w-px h-4 bg-surface-border" />
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-[14px] border border-brand-gold/22 bg-[linear-gradient(180deg,#e0bf67_0%,#c9a84c_100%)] px-4 py-2 text-sm font-semibold text-surface-base transition-all duration-200 hover:brightness-105 hover:shadow-gold-sm"
          >
            Open Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Mobile Toggle ── */}
        <button
          className="md:hidden p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-accent transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-[linear-gradient(180deg,rgba(8,10,14,0.95),rgba(8,10,14,0.92))] px-6 py-5 space-y-1 backdrop-blur-2xl">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-3 text-content-secondary border-b border-surface-border last:border-0 text-sm"
            >
              {link.label}
              <ArrowRight className="w-4 h-4 opacity-30" />
            </a>
          ))}
          <div className="pt-4">
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-gold text-surface-base font-semibold text-sm"
            >
              Open Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
