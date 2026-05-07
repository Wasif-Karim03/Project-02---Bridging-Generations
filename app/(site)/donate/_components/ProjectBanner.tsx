import Link from "next/link";
import type { Project } from "@/lib/content/projects";

type ProjectBannerProps = {
  project: Project;
};

export function ProjectBanner({ project }: ProjectBannerProps) {
  return (
    <div className="mb-6 flex flex-col gap-1 bg-ground-3 p-4 text-body-sm">
      <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">You're supporting</span>
      <p className="text-ink">
        {project.title} —{" "}
        <Link
          href={`/projects#${project.id}`}
          className="text-accent underline underline-offset-[3px] transition hover:text-accent-2-text"
        >
          back to project
        </Link>
      </p>
    </div>
  );
}
