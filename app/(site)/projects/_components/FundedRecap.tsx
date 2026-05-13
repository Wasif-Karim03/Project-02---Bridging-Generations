import { ProgramCard } from "@/components/domain/ProgramCard";
import type { Project } from "@/lib/content/projects";

type FundedRecapProps = {
  projects: Project[];
};

export function FundedRecap({ projects }: FundedRecapProps) {
  if (projects.length === 0) return null;
  const isSingle = projects.length === 1;
  return (
    <section
      aria-labelledby="projects-funded-title"
      className="bg-ground-3 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <header className="flex flex-col gap-2">
          <h2 id="projects-funded-title" className="text-balance text-heading-1 text-ink">
            Fully funded — thank you
          </h2>
          <p className="max-w-[56ch] text-body text-ink-2">
            These projects closed with every dollar raised. Huge thanks to the donors who made them
            happen.
          </p>
        </header>
        {isSingle ? (
          <ProgramCard project={projects[0]} scale="feature" />
        ) : (
          <ul className="flex flex-col">
            {projects.map((project) => (
              <ProgramCard key={project.id} project={project} scale="row" as="li" />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
