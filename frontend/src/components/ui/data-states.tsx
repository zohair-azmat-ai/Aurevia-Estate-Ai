"use client";

import { AlertTriangle, RefreshCw, Search, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";
import { getRuntimeModeLabel, isDemoFallbackEnabled } from "../../lib/demo";

export function ShimmerCard({ className }: { className?: string }) {
  return (
    <div className={cn("group relative overflow-hidden rounded-[24px] border border-white/8 bg-black/20 p-5", className)}>
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-gold/35 to-transparent opacity-60" />
      <div className="shimmer h-4 w-24 rounded-full" />
      <div className="mt-4 shimmer h-8 w-2/3 rounded-full" />
      <div className="mt-4 shimmer h-4 w-full rounded-full" />
      <div className="mt-3 shimmer h-4 w-5/6 rounded-full" />
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="shimmer h-20 rounded-[18px]" />
        <div className="shimmer h-20 rounded-[18px]" />
        <div className="shimmer h-20 rounded-[18px]" />
      </div>
    </div>
  );
}

export function ErrorState({
  title,
  message,
  description,
  onRetry,
  onAction,
  actionLabel,
}: {
  title: string;
  message?: string;
  description?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}) {
  const action = onAction ?? onRetry;
  const copy = description ?? message ?? "Something went wrong.";
  const runtime = getRuntimeModeLabel();

  return (
    <div className="rounded-[28px] border border-status-red/20 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.12),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.01)_100%)] p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-status-red/20 bg-status-red/10 text-status-red">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-content-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-content-secondary">{copy}</p>
      {isDemoFallbackEnabled() ? (
        <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-brand-gold/15 bg-brand-gold/10 px-4 py-3 text-left text-sm text-content-secondary">
          <span className="font-medium text-content-primary">{runtime.label}:</span> {runtime.description}
        </div>
      ) : null}
      {action ? (
        <button
          type="button"
          onClick={action}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20 hover:bg-white/8"
        >
          <RefreshCw className="h-4 w-4 text-brand-gold" />
          {actionLabel ?? "Retry"}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  description,
  icon = "search",
  onAction,
  actionLabel,
}: {
  title: string;
  message?: string;
  description?: string;
  icon?: "search" | "sparkles";
  onAction?: () => void;
  actionLabel?: string;
}) {
  const Icon = icon === "sparkles" ? Sparkles : Search;
  const copy = description ?? message ?? "No records available.";
  const runtime = getRuntimeModeLabel();

  return (
    <div className="rounded-[28px] border border-dashed border-brand-gold/20 bg-[radial-gradient(circle_at_top,rgba(201,168,76,0.12),rgba(255,255,255,0.02)_45%,rgba(255,255,255,0.01)_100%)] p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-content-primary">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm text-content-secondary">{copy}</p>
      {isDemoFallbackEnabled() ? (
        <p className="mx-auto mt-4 max-w-2xl text-xs uppercase tracking-[0.22em] text-brand-gold/75">
          {runtime.label}
        </p>
      ) : null}
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-content-primary transition hover:border-brand-gold/20 hover:bg-white/8"
        >
          <RefreshCw className="h-4 w-4 text-brand-gold" />
          {actionLabel ?? "Refresh"}
        </button>
      ) : null}
    </div>
  );
}
