import Image from "next/image";

interface ShowcaseCard {
  image: string;
  imageAlt: string;
  badge: { text: string; dot: string; textColor: string; bg: string };
  property: string;
  location: string;
  price: string;
  specs: string;
  activity: { icon: string; title: string; detail: string; tag: string; tagColor: string; tagBg: string };
}

const SHOWCASE_CARDS: ShowcaseCard[] = [
  {
    image:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=700&q=85&auto=format&fit=crop",
    imageAlt: "Modern minimalist luxury villa",
    badge: {
      text: "Lead Captured · WhatsApp",
      dot: "bg-status-green",
      textColor: "text-status-green",
      bg: "bg-status-green-subtle",
    },
    property: "Downtown Penthouse",
    location: "Business Bay, Dubai",
    price: "AED 4.8M",
    specs: "3 BR · 3,100 sqft",
    activity: {
      icon: "🤖",
      title: "AI detected: Viewing Request",
      detail: "Reply sent in 0.9s · GPT-4o",
      tag: "94% confidence",
      tagColor: "text-status-purple",
      tagBg: "bg-status-purple-subtle",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=700&q=85&auto=format&fit=crop",
    imageAlt: "Luxury apartment interior",
    badge: {
      text: "Lead Qualified · Email",
      dot: "bg-brand-gold",
      textColor: "text-brand-gold",
      bg: "bg-brand-gold-subtle",
    },
    property: "Jumeirah Beach Apt",
    location: "JBR, Dubai",
    price: "AED 185K / yr",
    specs: "2 BR · 1,850 sqft",
    activity: {
      icon: "✅",
      title: "Requirements extracted",
      detail: "Budget · Location · Type · Bedrooms",
      tag: "CRM updated",
      tagColor: "text-status-green",
      tagBg: "bg-status-green-subtle",
    },
  },
  {
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=85&auto=format&fit=crop",
    imageAlt: "Luxury villa exterior",
    badge: {
      text: "Follow-Up Sent · Auto",
      dot: "bg-status-blue",
      textColor: "text-status-blue",
      bg: "bg-status-blue-subtle",
    },
    property: "Palm Jumeirah Villa",
    location: "Palm Jumeirah, Dubai",
    price: "AED 22M",
    specs: "6 BR · 9,500 sqft",
    activity: {
      icon: "📅",
      title: "Follow-up scheduled",
      detail: "Day 2 · WhatsApp reminder queued",
      tag: "Sequence: Step 2",
      tagColor: "text-status-blue",
      tagBg: "bg-status-blue-subtle",
    },
  },
];

function ShowcaseCard({ card }: { card: ShowcaseCard }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden border border-surface-border hover:border-brand-gold/25 transition-all duration-300 hover:shadow-card-hover bg-surface-elevated">

      {/* Property Image */}
      <div className="relative h-56 overflow-hidden">
        <Image
          src={card.image}
          alt={card.imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-base via-surface-base/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${card.badge.bg} border border-white/10`}>
            <span className={`w-1.5 h-1.5 rounded-full ${card.badge.dot}`} />
            <span className={`text-[11px] font-semibold ${card.badge.textColor}`}>
              {card.badge.text}
            </span>
          </div>
        </div>
      </div>

      {/* Property Info */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-content-primary font-semibold text-base">{card.property}</h3>
            <p className="text-content-muted text-sm mt-0.5">{card.location}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-brand-gold font-semibold">{card.price}</p>
            <p className="text-content-muted text-xs mt-0.5">{card.specs}</p>
          </div>
        </div>

        {/* AI activity card */}
        <div className="p-3.5 rounded-xl bg-surface-base border border-surface-border flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{card.activity.icon}</span>
          <div className="min-w-0 space-y-1">
            <p className="text-content-primary text-xs font-semibold leading-snug">
              {card.activity.title}
            </p>
            <p className="text-content-muted text-[11px]">{card.activity.detail}</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${card.activity.tagBg} ${card.activity.tagColor}`}
            >
              {card.activity.tag}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Showcase() {
  return (
    <section
      id="showcase"
      className="relative py-28 bg-surface-elevated border-y border-surface-border"
    >
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[radial-gradient(ellipse,rgba(201,168,76,0.04)_0%,transparent_70%)]" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* ── Section Header ── */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
          <p className="label-caps text-brand-gold">Product in Action</p>
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-content-primary leading-tight">
            See Aurevia
            <br />
            <span className="text-gradient-gold">work for you</span>
          </h2>
          <p className="text-content-secondary text-lg leading-relaxed">
            Every lead is captured, qualified, and acted upon — with full context,
            zero manual work.
          </p>
        </div>

        {/* ── Showcase Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SHOWCASE_CARDS.map((card) => (
            <ShowcaseCard key={card.property} card={card} />
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { value: "< 1.5s", label: "Avg. AI response time" },
            { value: "3+", label: "Channels supported" },
            { value: "100%", label: "Automated CRM updates" },
            { value: "24/7", label: "Always-on lead capture" },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1.5">
              <p className="text-3xl font-light text-gradient-gold">{stat.value}</p>
              <p className="text-sm text-content-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
