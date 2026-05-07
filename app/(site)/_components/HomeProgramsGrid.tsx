import { Link } from "next-view-transitions";
import { ProgramCard } from "@/components/domain/ProgramCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Project } from "@/lib/content/projects";

type HomeProgramsGridProps = {
  projects: Project[];
};

export function HomeProgramsGrid({ projects }: HomeProgramsGridProps) {
  const [feature, ...rest] = projects;
  return (
    <section
      id="programs"
      aria-labelledby="home-programs-title"
      className="scroll-mt-20 bg-ground py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <header className="mb-12 flex flex-col gap-4 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>How we help</Eyebrow>
            <h2 id="home-programs-title" className="text-balance text-heading-2 text-ink">
              Our programs
            </h2>
          </div>
          <Link
            href="/projects"
            className="group inline-flex min-h-[44px] items-center gap-1 py-2 text-nav-link uppercase text-accent transition hover:text-accent-2-text active:text-accent-2-text"
          >
            See all programs
            <span
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-active:translate-x-1"
            >
              →
            </span>
          </Link>
        </header>
        <div className="flex flex-col gap-12 lg:gap-16">
          {feature ? <ProgramCard project={feature} scale="feature" /> : null}
          {rest.length > 0 ? (
            <ul className="flex flex-col">
              {rest.map((project) => (
                <ProgramCard key={project.id} project={project} scale="row" as="li" />
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
