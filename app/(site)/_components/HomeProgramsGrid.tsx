import { Link } from "next-view-transitions";
import { ProgramCard } from "@/components/domain/ProgramCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import type { Project } from "@/lib/content/projects";

type HomeProgramsGridProps = {
  projects: Project[];
};

// Spec: 6 project cards in a grid. Each shows image, name, progress bar with
// %, $ remaining, and a per-project Donate Now CTA. We use the `card` scale
// of ProgramCard so the visual language remains consistent with the rest of
// the site's editorial primitives.
export function HomeProgramsGrid({ projects }: HomeProgramsGridProps) {
  return (
    <section
      id="programs"
      aria-labelledby="home-programs-title"
      className="scroll-mt-20 bg-ground py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <Reveal stagger="up">
          <header className="mb-12 flex flex-col gap-4 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <Eyebrow>How we help</Eyebrow>
              <h2 id="home-programs-title" className="text-balance text-heading-2 text-ink">
                Our projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="group inline-flex min-h-[44px] items-center gap-1 py-2 text-nav-link uppercase text-accent transition hover:text-accent-2-text active:text-accent-2-text"
            >
              See all projects
              <span
                aria-hidden="true"
                className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-active:translate-x-1"
              >
                →
              </span>
            </Link>
          </header>
        </Reveal>
        {projects.length > 0 ? (
          <Reveal cascade cascadeDelay={100}>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {projects.slice(0, 6).map((project) => (
                <li key={project.id} data-reveal-item className="flex">
                  <ProgramCard project={project} scale="card" />
                </li>
              ))}
            </ul>
          </Reveal>
        ) : (
          <p className="text-body-sm text-ink-2">No projects to show yet.</p>
        )}
      </div>
    </section>
  );
}
