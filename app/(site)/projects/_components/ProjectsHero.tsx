import { Eyebrow } from "@/components/ui/Eyebrow";

type ProjectsHeroProps = {
  count: number;
  totalRaised: number;
};

export function ProjectsHero({ count, totalRaised }: ProjectsHeroProps) {
  return (
    <section
      aria-labelledby="projects-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <Eyebrow>Core initiatives</Eyebrow>
        <h1 id="projects-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
          Our projects.
        </h1>
        <p className="max-w-[28ch] text-balance text-heading-2 text-accent">
          ${totalRaised.toLocaleString()} funded across {count}{" "}
          {count === 1 ? "project" : "projects"}.
        </p>
        <p className="max-w-[44ch] text-body-lg text-ink-2">
          Sponsorships keep children in the classroom; projects fund the things the classroom itself
          needs — meals, books, scholarships, labs, and libraries.
        </p>
      </div>
    </section>
  );
}
