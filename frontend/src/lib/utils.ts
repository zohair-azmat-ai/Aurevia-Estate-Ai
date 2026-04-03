import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Channel, Intent, LeadStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  value: number,
  currency = "AED",
  locale = "en-AE",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatBudget(
  min: number | null,
  max: number | null,
  currency = "AED",
): string {
  if (!min && !max) return "Not specified";
  if (!min) return `Up to ${formatCurrency(max!, currency)}`;
  if (!max) return `From ${formatCurrency(min, currency)}`;
  return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-AE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(iso);
}

export const CHANNEL_CONFIG: Record<
  Channel,
  { label: string; color: string; bg: string }
> = {
  website: {
    label: "Website",
    color: "text-status-blue",
    bg: "bg-status-blue-subtle",
  },
  whatsapp: {
    label: "WhatsApp",
    color: "text-status-green",
    bg: "bg-status-green-subtle",
  },
  email: {
    label: "Email",
    color: "text-status-purple",
    bg: "bg-status-purple-subtle",
  },
  phone: {
    label: "Phone",
    color: "text-status-amber",
    bg: "bg-status-amber-subtle",
  },
};

export const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string }
> = {
  new: { label: "New", color: "text-status-blue", bg: "bg-status-blue-subtle" },
  contacted: { label: "Contacted", color: "text-status-amber", bg: "bg-status-amber-subtle" },
  qualified: { label: "Qualified", color: "text-status-green", bg: "bg-status-green-subtle" },
  escalated: { label: "Escalated", color: "text-status-red", bg: "bg-status-red-subtle" },
  viewing: { label: "Viewing", color: "text-status-purple", bg: "bg-status-purple-subtle" },
  negotiation: { label: "Negotiation", color: "text-brand-gold", bg: "bg-brand-gold/10" },
  closed: { label: "Closed", color: "text-content-muted", bg: "bg-surface-accent" },
  closed_won: { label: "Closed Won", color: "text-status-green", bg: "bg-status-green-subtle" },
  lost: { label: "Lost", color: "text-content-muted", bg: "bg-surface-accent" },
  closed_lost: { label: "Closed Lost", color: "text-content-muted", bg: "bg-surface-accent" },
};

export const INTENT_LABELS: Record<Intent, string> = {
  buy: "Buy Intent",
  rent: "Rent Intent",
  inquiry: "General Inquiry",
  viewing_request: "Viewing Request",
  pricing: "Pricing",
  complaint: "Complaint",
  follow_up: "Follow Up",
  other: "Other",
};

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}
