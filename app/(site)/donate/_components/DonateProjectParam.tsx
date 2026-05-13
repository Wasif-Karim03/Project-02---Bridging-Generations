"use client";

import { useSearchParams } from "next/navigation";
import type { Project } from "@/lib/content/projects";
import { ProjectBanner } from "./ProjectBanner";

type DonateProjectParamProps = {
  projects: Project[];
};

export function DonateProjectParam({ projects }: DonateProjectParamProps) {
  const projectId = useSearchParams().get("project");
  if (!projectId) return null;
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  return <ProjectBanner project={project} />;
}
