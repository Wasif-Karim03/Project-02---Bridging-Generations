import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { projectCollection } from "@/keystatic/collections/project";
import { reader } from "./reader";

export type Project = Entry<typeof projectCollection> & { id: string };

export async function getAllProjects(): Promise<Project[]> {
  const entries = await reader.collections.project.all();
  return entries.map(({ slug, entry }) => ({ ...entry, id: slug }));
}

export async function getFeaturedProjects(limit = 2): Promise<Project[]> {
  const projects = await getAllProjects();
  const ranked = [...projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const active = ranked.filter((p) => p.status !== "paused");
  return active.slice(0, limit);
}

export type ProjectStatus = Project["status"];

export type ProjectsByStatus = {
  active: Project[];
  paused: Project[];
  funded: Project[];
};

function byOrder(a: Project, b: Project) {
  return (a.order ?? 0) - (b.order ?? 0);
}

export function splitProjectsByStatus(projects: Project[]): ProjectsByStatus {
  const sorted = [...projects].sort(byOrder);
  return {
    active: sorted.filter((p) => p.status === "active"),
    paused: sorted.filter((p) => p.status === "paused"),
    funded: sorted.filter((p) => p.status === "funded"),
  };
}

export async function getProjectsByStatus(): Promise<ProjectsByStatus> {
  return splitProjectsByStatus(await getAllProjects());
}
