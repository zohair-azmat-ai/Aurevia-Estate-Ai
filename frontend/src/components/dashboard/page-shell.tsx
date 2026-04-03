"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Clock3, Info, Menu, Search, Sparkles, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn, getInitials } from "../../lib/utils";
import { DashboardSidebar, dashboardNavItems } from "./navigation";
import { getRuntimeModeLabel } from "../../lib/demo";

const pageMeta: Record<
  string,
  {
    title: string;
    description: string;
    eyebrow: string;
  }
> = {
  "/dashboard": {
    title: "Command Dashboard",
    description: "Track every lead signal, automation queue, and handoff metric from one premium control room.",
    eyebrow: "Aurevia overview",
  },
  "/leads": {
    title: "Leads",
    description: "Monitor pipeline health, qualification confidence, and priority opportunities.",
    eyebrow: "Pipeline management",
  },
  "/conversations": {
    title: "Conversations",
    description: "Review cross-channel threads and AI response quality at a glance.",
    eyebrow: "Unified inbox",
  },
  "/analytics": {
    title: "Analytics",
    description: "Measure conversion velocity, source quality, and operational performance.",
    eyebrow: "Performance insights",
  },
  "/follow-ups": {
    title: "Follow-Ups",
    description: "Keep every touchpoint scheduled, contextual, and on-brand.",
    eyebrow: "Automation cadence",
  },
  "/escalations": {
    title: "Escalations",
    description: "Surface priority handoffs before high-intent buyers cool off.",
    eyebrow: "Human intervention",
  },
  "/knowledge": {
    title: "Knowledge",
    description: "Manage the property intelligence and policies powering every answer.",
    eyebrow: "RAG control",
  },
  "/integrations": {
    title: "Integrations",
    description: "Connect channels, data sources, and CRM workflows with confidence.",
    eyebrow: "Connected systems",
  },
  "/settings": {
    title: "Settings",
    description: "Refine workspace preferences, brand rules, and platform defaults.",
    eyebrow: "Workspace control",
  },
};

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(() => new Date());

  const meta = useMemo(() => pageMeta[pathname] ?? pageMeta["/dashboard"], [pathname]);
  const activeNav = dashboardNavItems.find((item) => item.href === pathname);
  const runtime = getRuntimeModeLabel();

  useEffect(() => {
    setRefreshedAt(new Date());
  }, [pathname]);

  return (
    <div className="dashboard-premium-bg min-h-screen text-content-primary">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(68,103,156,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_16%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[280px] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_55%)]" />

      <div className="relative flex min-h-screen">
        <div className="hidden xl:fixed xl:inset-y-0 xl:flex xl:w-[310px] xl:flex-col">
          <DashboardSidebar />
        </div>

        <Dialog.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[320px] border-r border-white/10 bg-surface-elevated xl:hidden">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
              <Dialog.Close className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-content-secondary transition hover:text-content-primary">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="flex min-h-screen w-full flex-col xl:pl-[310px]">
          <header className="sticky top-0 z-30 border-b border-white/8 bg-[linear-gradient(180deg,rgba(7,9,13,0.92),rgba(8,10,14,0.82))] backdrop-blur-2xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-content-secondary transition hover:text-content-primary xl:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="label-caps text-brand-gold/80">{meta.eyebrow}</span>
                  <Sparkles className="h-3.5 w-3.5 text-brand-gold/80" />
                </div>
                <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <h1 className="text-2xl font-semibold tracking-[-0.04em] text-content-primary sm:text-3xl">
                    {meta.title}
                  </h1>
                  {activeNav ? (
                    <span className="rounded-full border border-brand-gold/15 bg-brand-gold/10 px-3 py-1 text-xs font-medium text-brand-gold">
                      {activeNav.label}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 max-w-2xl text-sm text-content-secondary">{meta.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-gold/15 bg-[linear-gradient(180deg,rgba(201,168,76,0.18),rgba(201,168,76,0.08))] px-3 py-1.5 text-xs font-medium text-brand-gold shadow-[0_0_0_1px_rgba(201,168,76,0.04)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {runtime.label}
                  </span>
                  <span
                    title={runtime.description}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-content-secondary"
                  >
                    <Info className="h-3.5 w-3.5 text-brand-gold" />
                    {runtime.description}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-content-secondary">
                    <Clock3 className="h-3.5 w-3.5 text-brand-gold" />
                    Last refreshed {refreshedAt.toLocaleTimeString("en-AE", { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="hidden min-w-[280px] max-w-[360px] flex-1 xl:block">
                <label className="glass flex h-12 items-center gap-3 rounded-[20px] px-4 text-content-secondary transition focus-within:border-brand-gold/35 focus-within:bg-white/8">
                  <Search className="h-4.5 w-4.5 text-brand-gold" />
                  <input
                    aria-label="Search dashboard"
                    placeholder="Search leads, conversations, or knowledge..."
                    className="w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
                  />
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  title="Notifications and product health"
                  className="glass relative inline-flex h-12 w-12 items-center justify-center rounded-[20px] text-content-secondary transition hover:border-brand-gold/25 hover:text-content-primary"
                  aria-label="Notifications"
                >
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-brand-gold shadow-[0_0_0_4px_rgba(201,168,76,0.12)]" />
                </button>

                <Link
                  href="/settings"
                  className="glass group flex items-center gap-3 rounded-[20px] px-3 py-2.5 transition hover:border-brand-gold/20 hover:bg-white/7"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-sm font-semibold text-brand-gold">
                    {getInitials("Admin Aurevia")}
                  </div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-medium text-content-primary">Admin Console</p>
                    <p className="text-xs text-content-secondary">Portfolio workspace</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="border-t border-white/6 px-4 py-3 sm:px-6 xl:hidden">
              <label className="glass mx-auto flex w-full max-w-[1600px] items-center gap-3 rounded-[20px] px-4 text-content-secondary transition focus-within:border-brand-gold/35 focus-within:bg-white/8">
                <Search className="h-4.5 w-4.5 text-brand-gold" />
                <input
                  aria-label="Search dashboard"
                  placeholder="Search leads, conversations, or knowledge..."
                  className="h-11 w-full bg-transparent text-sm text-content-primary outline-none placeholder:text-content-muted"
                />
              </label>
            </div>
          </header>

          <main className="relative flex-1">
            <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="dashboard-frame-outer p-3 sm:p-4 lg:p-5">
                <div className={cn("dashboard-frame-inner p-4 transition-all duration-300 motion-safe:animate-[fadeIn_420ms_ease] sm:p-6 lg:p-7")}>
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

type PageContainerProps = {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageContainer({
  children,
  eyebrow,
  title,
  description,
  actions,
}: PageContainerProps) {
  return (
    <div className="space-y-6 lg:space-y-8">
      {title || description || eyebrow || actions ? (
        <section className="flex flex-col gap-4 rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(201,168,76,0.08),rgba(255,255,255,0.025)_38%,rgba(59,130,246,0.04)_100%)] p-6 lg:flex-row lg:items-end lg:justify-between lg:p-7">
          <div className="max-w-3xl">
            {eyebrow ? <p className="label-caps mb-3 text-brand-gold/80">{eyebrow}</p> : null}
            {title ? (
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-content-primary sm:text-3xl">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-3 text-sm text-content-secondary sm:text-base">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </section>
      ) : null}

      {children}
    </div>
  );
}
