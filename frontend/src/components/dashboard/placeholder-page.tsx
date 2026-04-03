import { ArrowUpRight, Layers3, Sparkles } from "lucide-react";
import { PageContainer } from "../../components/dashboard/page-shell";

type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  badge: string;
};

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  badge,
}: PlaceholderPageProps) {
  return (
    <PageContainer eyebrow={eyebrow} title={title} description={description}>
      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[30px] border border-white/8 bg-[linear-gradient(160deg,rgba(201,168,76,0.08),rgba(255,255,255,0.02)_34%,rgba(255,255,255,0.02)_100%)] p-6 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="label-caps text-brand-gold/80">Module staged</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                {badge}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-gold/20 bg-brand-gold/10 text-brand-gold">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm text-content-secondary">
            This section is intentionally presented as a polished placeholder while Phase 2 continues. The reusable dashboard shell, responsive structure, and visual system are ready for the next functional module.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="label-caps">Design ready</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-content-primary">
                100%
              </p>
              <p className="mt-2 text-sm text-content-secondary">
                Premium shell and responsive layout complete.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="label-caps">Phase status</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-content-primary">
                Step 2.2
              </p>
              <p className="mt-2 text-sm text-content-secondary">
                Ready for page-specific data wiring and interactions.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
              <p className="label-caps">Next up</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-content-primary">
                Feature layer
              </p>
              <p className="mt-2 text-sm text-content-secondary">
                Live widgets, tables, filters, and API-backed states.
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[30px] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-brand-gold">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <p className="label-caps">Premium empty state</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-content-primary">
                Ready for live content
              </h3>
            </div>
          </div>

          <p className="mt-4 text-sm text-content-secondary">
            The structural system is in place, including consistent page framing, command surfaces, and high-contrast data panels that match the landing page brand language.
          </p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-content-primary">Reusable container system</p>
                <ArrowUpRight className="h-4 w-4 text-brand-gold" />
              </div>
              <p className="mt-2 text-sm text-content-secondary">
                Shared hero header, section spacing, and panel styles.
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-content-primary">Responsive admin shell</p>
                <ArrowUpRight className="h-4 w-4 text-brand-gold" />
              </div>
              <p className="mt-2 text-sm text-content-secondary">
                Fixed desktop sidebar with a mobile drawer variant.
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-content-primary">Future-ready modules</p>
                <ArrowUpRight className="h-4 w-4 text-brand-gold" />
              </div>
              <p className="mt-2 text-sm text-content-secondary">
                Designed to accept tables, charts, feeds, and orchestration controls.
              </p>
            </div>
          </div>
        </article>
      </section>
    </PageContainer>
  );
}
