"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  addProjectLink,
  createProject,
  deleteProject,
  deleteProjectImage,
  deleteProjectLink,
  getProjectImage,
  updateProject,
} from "@/lib/db/queries/projects";
import { centsFromDollarsInput } from "@/lib/projects/format";
import { deleteFromR2ByUrl } from "@/lib/storage/r2";

const LIST = "/dashboard/admin/projects";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function intOrZero(formData: FormData, key: string): number {
  const n = Number.parseInt(str(formData, key), 10);
  return Number.isFinite(n) ? n : 0;
}

function revalidateProject(id: string): void {
  revalidatePath(`${LIST}/${id}`);
  revalidatePath(LIST);
  revalidatePath("/projects");
  revalidatePath(`/projects/[slug]`, "page");
}

export async function createProjectAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const name = str(formData, "name");
  if (!name) return;
  const project = await createProject(name);
  revalidatePath(LIST);
  redirect(`${LIST}/${project.id}`);
}

export async function saveProjectAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  const name = str(formData, "name");
  await updateProject(id, {
    ...(name ? { name } : {}),
    tagline: str(formData, "tagline") || null,
    description: str(formData, "description") || null,
    raisedCents: centsFromDollarsInput(str(formData, "raised")) ?? 0,
    targetCents: centsFromDollarsInput(str(formData, "target")) ?? 0,
    displayOrder: intOrZero(formData, "displayOrder"),
    published: formData.get("published") != null,
  });
  revalidateProject(id);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  await deleteProject(id);
  revalidatePath(LIST);
  revalidatePath("/projects");
  redirect(LIST);
}

export async function addLinkAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const projectId = str(formData, "projectId");
  const label = str(formData, "label");
  const url = str(formData, "url");
  if (!projectId || !label || !url) return;
  await addProjectLink({ projectId, label, url });
  revalidateProject(projectId);
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  const projectId = str(formData, "projectId");
  if (!id) return;
  await deleteProjectLink(id);
  if (projectId) revalidateProject(projectId);
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  const projectId = str(formData, "projectId");
  if (!id) return;
  const image = await getProjectImage(id);
  if (image) await deleteFromR2ByUrl(image.url);
  await deleteProjectImage(id);
  if (projectId) revalidateProject(projectId);
}

export async function removeCoverAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  const coverUrl = str(formData, "coverUrl");
  if (!id) return;
  if (coverUrl) await deleteFromR2ByUrl(coverUrl);
  await updateProject(id, { coverUrl: null });
  revalidateProject(id);
}
