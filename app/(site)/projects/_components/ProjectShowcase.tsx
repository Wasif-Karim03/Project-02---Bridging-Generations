import { Link } from "next-view-transitions";
import type { Project } from "@/db/schema";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { formatMoney, fundingPercent, remainingCents } from "@/lib/projects/format";

// Alternating project rows: the first project shows its cover on the right with
// the text on the left; the next flips, and so on. Each row links to the
// project's detail page.
export function ProjectShowcase({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28" aria-labelledby="projects-showcase-title">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <header className="flex flex-col gap-3">
          <Eyebrow>Our Projects</Eyebrow>
          <h2 id="projects-showcase-title" className="max-w-[24ch] text-balance text-display-3 text-ink">
            What your support is building
          </h2>
        </header>

        <div className="mt-8 flex flex-col gap-20 lg:gap-28">
          {projects.map((p, i) => {
            const pct = fundingPercent(p.raisedCents, p.targetCents);
            const remaining = remainingCents(p.raisedCents, p.targetCents);
            const coverRight = i % 2 === 0;
            return (
              <article key={p.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                <Link
                  href={`/projects/${p.slug}`}
                  className={`block overflow-hidden rounded-2xl border border-hairline ${coverRight ? "lg:order-2" : "lg:order-1"}`}
                >
                  {p.coverUrl ? (
                    // biome-ignore lint/performance/noImgElement: R2-hosted cover URL
                    <img
                      src={p.coverUrl}
                      alt={p.name}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="grid aspect-[4/3] w-full place-items-center bg-accent/10 text-meta uppercase text-accent">
                      No cover yet
                    </span>
                  )}
                </Link>

                <div className={`flex flex-col gap-5 ${coverRight ? "lg:order-1" : "lg:order-2"}`}>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-balance text-display-2 text-accent">
                      <Link
                        href={`/projects/${p.slug}`}
                        className="transition-colors hover:text-accent/75"
                      >
                        {p.name}
                      </Link>
                    </h3>
                    {p.tagline ? <p className="text-body-lg text-ink-2">{p.tagline}</p> : null}
                  </div>

                  {p.targetCents > 0 ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-ground-3">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-body font-medium text-ink">
                        <span className="text-accent-2-text">{pct}% funded</span>
                        {remaining > 0 ? (
                          <span className="text-ink-2"> · {formatMoney(remaining)} to go</span>
                        ) : (
                          <span className="text-ink-2"> · fully funded 🎉</span>
                        )}
                      </p>
                    </div>
                  ) : null}

                  <Link
                    href={`/projects/${p.slug}`}
                    className="inline-flex min-h-[48px] w-fit items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
                  >
                    Learn more →
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
