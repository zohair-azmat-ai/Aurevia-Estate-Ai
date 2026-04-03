import { ArrowRight, MessageSquare, Brain, Zap } from "lucide-react";

const STEPS = [
  {
    step: "01",
    icon: MessageSquare,
    iconBg: "bg-status-blue-subtle",
    iconColor: "text-status-blue",
    borderColor: "border-status-blue/20",
    label: "Lead Arrives",
    title: "Any channel, one pipeline",
    description:
      "A lead contacts you via website form, WhatsApp, or email. Aurevia captures the message instantly and normalizes it to a structured internal format.",
    bullets: [
      "Website form submissions",
      "WhatsApp webhook events",
      "Email inbox parsing",
      "Unified message format",
    ],
  },
  {
    step: "02",
    icon: Brain,
    iconBg: "bg-status-purple-subtle",
    iconColor: "text-status-purple",
    borderColor: "border-status-purple/20",
    label: "AI Processes",
    title: "Instant intelligence layer",
    description:
      "GPT-4o detects intent, extracts structured requirements, retrieves relevant context from your knowledge base, and generates a precise, on-brand reply.",
    bullets: [
      "Intent classification + confidence score",
      "Structured extraction via function calling",
      "RAG retrieval from Qdrant knowledge base",
      "Personalized AI reply generated",
    ],
  },
  {
    step: "03",
    icon: Zap,
    iconBg: "bg-brand-gold-subtle",
    iconColor: "text-brand-gold",
    borderColor: "border-brand-gold/20",
    label: "Actions Triggered",
    title: "Everything updates automatically",
    description:
      "The reply is delivered. Your CRM is updated. A follow-up is scheduled. If escalation is needed, the agent queue is notified. All logged to analytics.",
    bullets: [
      "CRM lead record created or updated",
      "Follow-up sequence scheduled",
      "Human escalation triggered if needed",
      "Event logged for analytics",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-28 bg-surface-elevated border-y border-surface-border"
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(201,168,76,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-20 space-y-4">
          <p className="label-caps text-brand-gold">The Workflow</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-content-primary leading-tight">
            From message to
            <br />
            <span className="text-gradient-gold">qualified lead in seconds</span>
          </h2>
          <p className="text-content-secondary text-lg leading-relaxed">
            Three steps. Fully automated. No human required — unless you want one.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-[72px] left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-status-blue/30 via-status-purple/30 to-brand-gold/30" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="relative flex flex-col gap-6">

                {/* Step card */}
                <div
                  className={`relative p-7 rounded-2xl bg-surface-base border ${step.borderColor} flex flex-col gap-6`}
                >
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-[52px] h-[52px] rounded-2xl ${step.iconBg} border ${step.borderColor} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-6 h-6 ${step.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-content-muted">
                        Step {step.step}
                      </p>
                      <p className={`text-xs font-semibold mt-0.5 ${step.iconColor}`}>
                        {step.label}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-content-primary font-semibold text-lg leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-content-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Bullets */}
                  <ul className="space-y-2">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${step.iconBg.replace("subtle", "")} mt-[5px] flex-shrink-0 ${step.iconColor.replace("text-", "bg-")} opacity-70`}
                        />
                        <span className="text-content-secondary text-sm">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mobile connector arrow */}
                {i < STEPS.length - 1 && (
                  <div className="flex justify-center lg:hidden">
                    <ArrowRight className="w-5 h-5 text-surface-border rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
