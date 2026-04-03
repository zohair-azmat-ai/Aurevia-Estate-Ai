import {
  Globe,
  Zap,
  Layers,
  BookOpen,
  Users,
  Shield,
  BarChart3,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  tags: string[];
}

const FEATURES: Feature[] = [
  {
    icon: Globe,
    iconBg: "bg-status-blue-subtle",
    iconColor: "text-status-blue",
    title: "Multi-Channel Capture",
    description:
      "Capture leads from website forms, WhatsApp webhooks, and email inboxes in a single unified pipeline. Every channel, one platform.",
    tags: ["Website", "WhatsApp", "Email"],
  },
  {
    icon: Zap,
    iconBg: "bg-status-purple-subtle",
    iconColor: "text-status-purple",
    title: "AI Intent Detection",
    description:
      "GPT-4o classifies every inbound message in milliseconds — inquiry, viewing request, pricing, complaint, or follow-up. With confidence scoring.",
    tags: ["GPT-4o", "Classification", "Confidence Score"],
  },
  {
    icon: Layers,
    iconBg: "bg-brand-gold-subtle",
    iconColor: "text-brand-gold",
    title: "Structured Extraction",
    description:
      "Extract budget, location, property type, bedrooms, and transaction type automatically using GPT-4o function calling. Zero manual input.",
    tags: ["Function Calling", "Budget", "Location"],
  },
  {
    icon: BookOpen,
    iconBg: "bg-status-amber-subtle",
    iconColor: "text-status-amber",
    title: "RAG Knowledge Base",
    description:
      "Ground every AI reply with your own listings, FAQs, area guides, pricing rules, and business policies. Accurate, brand-consistent answers.",
    tags: ["Qdrant", "Embeddings", "Semantic Search"],
  },
  {
    icon: Users,
    iconBg: "bg-status-green-subtle",
    iconColor: "text-status-green",
    title: "Auto CRM Update",
    description:
      "Lead records are created, enriched, and updated automatically after every interaction. Full timeline history. Zero manual data entry.",
    tags: ["PostgreSQL", "Auto-sync", "Timeline"],
  },
  {
    icon: Shield,
    iconBg: "bg-status-red-subtle",
    iconColor: "text-status-red",
    title: "Human Escalation",
    description:
      "When AI confidence drops below threshold or sentiment turns negative, route instantly to a human agent queue with full context.",
    tags: ["Confidence Threshold", "Sentiment", "Agent Queue"],
  },
  {
    icon: Clock,
    iconBg: "bg-status-blue-subtle",
    iconColor: "text-status-blue",
    title: "Follow-Up Automation",
    description:
      "Schedule multi-step follow-up sequences for unresponsive leads. Channel-aware delivery — same channel the lead came from.",
    tags: ["Sequences", "Scheduling", "Multi-step"],
  },
  {
    icon: BarChart3,
    iconBg: "bg-status-purple-subtle",
    iconColor: "text-status-purple",
    title: "Analytics & Events",
    description:
      "Every touchpoint is logged. Track conversion funnels, channel performance, response times, and AI accuracy from one dashboard.",
    tags: ["Funnels", "Events", "Performance"],
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <div className="group relative p-6 rounded-2xl bg-surface-elevated border border-surface-border hover:border-brand-gold/25 hover:shadow-[0_0_40px_rgba(201,168,76,0.06)] transition-all duration-300 flex flex-col gap-5">
      {/* Icon */}
      <div
        className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center border border-white/[0.04]`}
      >
        <Icon className={`w-5 h-5 ${feature.iconColor}`} />
      </div>

      {/* Content */}
      <div className="space-y-2.5 flex-1">
        <h3 className="text-content-primary font-semibold text-[15px] leading-snug">
          {feature.title}
        </h3>
        <p className="text-content-secondary text-sm leading-relaxed">
          {feature.description}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {feature.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide bg-surface-accent border border-surface-border text-content-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-28 bg-surface-base">
      {/* Subtle top separator glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-surface-border to-transparent" />

      <div className="max-w-7xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
          <p className="label-caps text-brand-gold">Platform Capabilities</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-content-primary leading-tight">
            Everything you need to
            <br />
            <span className="text-gradient-gold">automate real estate</span>
          </h2>
          <p className="text-content-secondary text-lg leading-relaxed">
            From inbound message to qualified lead — fully automated. Built for
            agencies, brokerages, and PropTech teams.
          </p>
        </div>

        {/* ── Feature Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
