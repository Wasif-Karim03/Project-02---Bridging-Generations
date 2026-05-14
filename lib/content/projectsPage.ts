import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { projectsPageSingleton } from "@/keystatic/singletons/projectsPage";
import { reader } from "./reader";

export type ProjectsPage = Entry<typeof projectsPageSingleton>;

export async function getProjectsPage(): Promise<ProjectsPage | null> {
  return reader.singletons.projectsPage.read();
}
