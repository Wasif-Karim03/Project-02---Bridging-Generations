import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { getProjectBySlug } from "@/lib/db/queries/projects";
import { formatMoney, fundingPercent, remainingCents } from "@/lib/projects/format";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.published) return { title: "Project" };
  return {
    title: project.name,
    description: project.tagline ?? `Support ${project.name} at Bridging Generations.`,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project || !project.published) notFound();

  const pct = fundingPercent(project.raisedCents, project.targetCents);
  const remaining = remainingCents(project.raisedCents, project.targetCents);

  return (
    <>
      <main className="bg-ground">
        {/* Cover */}
        {project.coverUrl ? (
          // biome-ignore lint/performance/noImgElement: R2-hosted cover URL
          <img
            src={project.coverUrl}
            alt={project.name}
            className="h-[38vh] max-h-[460px] w-full object-cover sm:h-[46vh]"
          />
        ) : null}

        <div className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <Link
              href="/projects"
              className="text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:text-accent-2-text"
            >
              ← All projects
            </Link>
          </nav>

          {/* Name + progress */}
          <header className="flex flex-col gap-5">
            <h1 className="text-balance text-display-1 text-accent">{project.name}</h1>
            {project.tagline ? <p className="text-body-lg text-ink-2">{project.tagline}</p> : null}

            {project.targetCents > 0 ? (
              <div className="flex max-w-[560px] flex-col gap-2">
                <div className="h-3 w-full overflow-hidden rounded-full bg-ground-3">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-body">
                  <span className="font-semibold text-ink">
                    {formatMoney(project.raisedCents)}{" "}
                    <span className="font-normal text-ink-2">
                      raised of {formatMoney(project.targetCents)}
                    </span>
                  </span>
                  <span className="font-medium text-accent-2-text">
                    {pct}% · {remaining > 0 ? `${formatMoney(remaining)} to go` : "fully funded"}
                  </span>
                </div>
              </div>
            ) : null}
          </header>

          {/* Gallery */}
          {project.images.length > 0 ? (
            <section className="mt-14">
              <h2 className="text-eyebrow uppercase text-accent">Gallery</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {project.images.map((img) => (
                  <li key={img.id} className="overflow-hidden rounded-xl border border-hairline">
                    {/* biome-ignore lint/performance/noImgElement: R2-hosted gallery URL */}
                    <img
                      src={img.url}
                      alt={img.caption ?? ""}
                      className="aspect-square w-full object-cover"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Description */}
          {project.description ? (
            <section className="mt-14">
              <h2 className="text-eyebrow uppercase text-accent">About this project</h2>
              <div className="mt-4 whitespace-pre-wrap text-body-lg leading-relaxed text-ink-2">
                {project.description}
              </div>
            </section>
          ) : null}

          {/* Links */}
          {project.links.length > 0 ? (
            <section className="mt-12">
              <h2 className="text-eyebrow uppercase text-accent">Links</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {project.links.map((l) => (
                  <li key={l.id}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-body font-medium text-accent-2-text underline underline-offset-[3px] hover:no-underline"
                    >
                      {l.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </main>

      <CTAFooterPanel
        headline="Help fund this project"
        body="Every gift moves a project closer to its goal."
        ctaLabel="Donate"
        ctaHref="/donate"
        tone="teal"
        titleId="project-cta-title"
      />
    </>
  );
}
