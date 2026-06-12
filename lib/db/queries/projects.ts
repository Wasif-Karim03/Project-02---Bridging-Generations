import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { Project, ProjectImage, ProjectLink } from "@/db/schema";
import { projectImages, projectLinks, projects } from "@/db/schema";
import { slugifyProject } from "@/lib/projects/format";

export type ProjectFull = Project & {
  images: ProjectImage[];
  links: ProjectLink[];
};

export async function listProjects(opts: { publishedOnly?: boolean } = {}): Promise<Project[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const base = db.select().from(projects);
  return (opts.publishedOnly ? base.where(eq(projects.published, true)) : base).orderBy(
    asc(projects.displayOrder),
    asc(projects.name),
  );
}

async function attach(project: Project): Promise<ProjectFull> {
  const db = getDb();
  const [images, links] = await Promise.all([
    db
      .select()
      .from(projectImages)
      .where(eq(projectImages.projectId, project.id))
      .orderBy(asc(projectImages.sortOrder), asc(projectImages.createdAt)),
    db
      .select()
      .from(projectLinks)
      .where(eq(projectLinks.projectId, project.id))
      .orderBy(asc(projectLinks.sortOrder), asc(projectLinks.createdAt)),
  ]);
  return { ...project, images, links };
}

export async function getProjectBySlug(slug: string): Promise<ProjectFull | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return rows[0] ? attach(rows[0]) : null;
}

export async function getProjectById(id: string): Promise<ProjectFull | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return rows[0] ? attach(rows[0]) : null;
}

async function uniqueSlug(name: string): Promise<string> {
  const db = getDb();
  const base = slugifyProject(name);
  const taken = new Set(
    (await db.select({ slug: projects.slug }).from(projects)).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createProject(name: string): Promise<Project> {
  const db = getDb();
  const slug = await uniqueSlug(name);
  const [row] = await db.insert(projects).values({ slug, name }).returning();
  return row;
}

export async function updateProject(
  id: string,
  patch: Partial<
    Pick<
      Project,
      | "name"
      | "tagline"
      | "description"
      | "coverUrl"
      | "raisedCents"
      | "targetCents"
      | "displayOrder"
      | "published"
    >
  >,
): Promise<void> {
  const db = getDb();
  await db
    .update(projects)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(projects.id, id));
}

export async function deleteProject(id: string): Promise<void> {
  const db = getDb();
  await db.delete(projects).where(eq(projects.id, id));
}

export async function addProjectImage(input: {
  projectId: string;
  url: string;
  caption?: string | null;
  sortOrder?: number;
}): Promise<void> {
  const db = getDb();
  await db.insert(projectImages).values({
    projectId: input.projectId,
    url: input.url,
    caption: input.caption || null,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function getProjectImage(id: string): Promise<ProjectImage | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(projectImages).where(eq(projectImages.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteProjectImage(id: string): Promise<void> {
  const db = getDb();
  await db.delete(projectImages).where(eq(projectImages.id, id));
}

export async function addProjectLink(input: {
  projectId: string;
  label: string;
  url: string;
  sortOrder?: number;
}): Promise<void> {
  const db = getDb();
  await db.insert(projectLinks).values({
    projectId: input.projectId,
    label: input.label,
    url: input.url,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function deleteProjectLink(id: string): Promise<void> {
  const db = getDb();
  await db.delete(projectLinks).where(eq(projectLinks.id, id));
}
