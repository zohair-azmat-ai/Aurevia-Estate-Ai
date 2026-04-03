"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BellRing,
  BookOpen,
  Bot,
  ChevronRight,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  Link2,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { cn } from "../../lib/utils";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UsersRound, badge: "24" },
  { href: "/conversations", label: "Conversations", icon: MessageSquareText, badge: "8" },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/follow-ups", label: "Follow-Ups", icon: BellRing, badge: "12" },
  { href: "/escalations", label: "Escalations", icon: ShieldAlert, badge: "3" },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/integrations", label: "Integrations", icon: Link2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const sidebarHighlights = [
  {
    label: "AI command center",
    value: "94.8%",
    description: "Reply precision across WhatsApp, web, and email.",
  },
  {
    label: "Escalation control",
    value: "11 min",
    description: "Median handoff time for high-intent opportunities.",
  },
];

type DashboardSidebarProps = {
  onNavigate?: () => void;
};

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01)_14%,rgba(0,0,0,0)_22%),linear-gradient(180deg,#0b0e17_0%,#080b12_100%)]">

      {/* ── Logo / Brand header ── */}
      <div className="border-b border-white/[0.07] px-5 py-5">
        <Link href="/dashboard" className="group flex items-start gap-3" onClick={onNavigate}>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/28 bg-[linear-gradient(180deg,rgba(201,168,76,0.18),rgba(201,168,76,0.09))] shadow-[0_0_20px_rgba(201,168,76,0.10)]">
            <Bot className="h-5 w-5 text-brand-gold" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-gold/85">
                Aurevia
              </span>
              <Sparkles className="h-3.5 w-3.5 text-brand-gold" />
            </div>
            <div>
              <p className="text-sm font-semibold text-content-primary">Estate AI Console</p>
              <p className="text-xs text-content-secondary">Luxury operations intelligence</p>
            </div>
          </div>
        </Link>

        {/* Back to site link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-4 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-content-muted transition hover:border-brand-gold/20 hover:bg-brand-gold/8 hover:text-brand-gold/80 group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to site</span>
          <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
        </Link>
      </div>

      {/* ── Nav items ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {/* Command card */}
        <div className="mb-5 rounded-[28px] border border-brand-gold/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),radial-gradient(circle_at_top,rgba(201,168,76,0.20),rgba(201,168,76,0.05)_42%,rgba(7,9,13,0.98)_100%)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <p className="label-caps text-brand-gold/75">Portfolio command layer</p>
          <h2 className="mt-3 text-lg font-semibold text-content-primary">
            Premium automation stack for elite broker teams.
          </h2>
          <p className="mt-2 text-sm text-content-secondary">
            Routing every opportunity through qualification, follow-up, and handoff with calm precision.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-content-primary">
            <span className="h-2 w-2 rounded-full bg-status-green shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            All systems synced
          </div>
        </div>

        <nav className="space-y-1.5">
          {dashboardNavItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group flex items-center gap-3 rounded-[20px] border px-3.5 py-3 text-sm transition-all duration-200",
                  active
                    ? "border-brand-gold/24 bg-[linear-gradient(180deg,rgba(201,168,76,0.17),rgba(201,168,76,0.09))] text-brand-gold shadow-[0_0_0_1px_rgba(201,168,76,0.05),0_20px_60px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "border-white/[0.03] bg-white/[0.015] text-content-secondary hover:border-white/8 hover:bg-white/[0.04] hover:text-content-primary"
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                    active
                      ? "border-brand-gold/22 bg-brand-gold/12 text-brand-gold"
                      : "border-white/6 bg-white/[0.03] text-content-secondary group-hover:text-content-primary"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="flex-1 font-medium">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      active
                        ? "bg-brand-gold/16 text-brand-gold"
                        : "bg-white/6 text-content-secondary"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      active ? "text-brand-gold" : "text-content-muted group-hover:translate-x-0.5"
                    )}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom highlights panel ── */}
      <div className="border-t border-white/[0.07] p-4">
        <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-status-blue/20 bg-status-blue/10 text-status-blue">
              <Inbox className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-content-primary">Executive signal</p>
              <p className="text-xs text-content-secondary">Today&apos;s operational snapshot</p>
            </div>
          </div>
          <div className="space-y-3">
            {sidebarHighlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-[20px] border border-white/6 bg-black/28 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-content-muted">
                    {highlight.label}
                  </p>
                  <p className="text-sm font-semibold text-content-primary">{highlight.value}</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-content-secondary">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
