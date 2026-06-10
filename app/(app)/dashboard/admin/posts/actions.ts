"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  addBlogPostLink,
  createBlogPost,
  deleteBlogPost,
  deleteBlogPostLink,
  updateBlogPost,
} from "@/lib/db/queries/blogPosts";

const LIST = "/dashboard/admin/posts";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function revalidatePost(id: string): void {
  revalidatePath(`${LIST}/${id}`);
  revalidatePath(LIST);
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
}

export async function createPostAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const title = str(formData, "title");
  if (!title) return;
  const post = await createBlogPost(title);
  revalidatePath(LIST);
  redirect(`${LIST}/${post.id}`);
}

export async function savePostAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  const title = str(formData, "title");
  await updateBlogPost(id, {
    ...(title ? { title } : {}),
    body: str(formData, "body") || null,
    displayOrder: Number.parseInt(str(formData, "displayOrder"), 10) || 0,
    published: formData.get("published") != null,
  });
  revalidatePost(id);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  await deleteBlogPost(id);
  revalidatePath(LIST);
  revalidatePath("/blog");
  redirect(LIST);
}

export async function removePostCoverAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  await updateBlogPost(id, { coverUrl: null });
  revalidatePost(id);
}

export async function addPostLinkAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const postId = str(formData, "postId");
  const label = str(formData, "label");
  const url = str(formData, "url");
  if (!postId || !label || !url) return;
  await addBlogPostLink({ postId, label, url });
  revalidatePost(postId);
}

export async function deletePostLinkAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  const postId = str(formData, "postId");
  if (!id) return;
  await deleteBlogPostLink(id);
  if (postId) revalidatePost(postId);
}
