"use server";

import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import {
  deleteMediaFolder,
  deleteMediaItem,
  getMediaFolderById,
  insertMediaItem,
} from "@/lib/db/queries/mediaFolders";

export type AddItemState = { ok: true } | { ok: false; error: string } | null;

// Add an item (image / link / other) to an existing folder. Authorisation:
// the folder must be owned by the current user OR the current user is admin.
// File uploads aren't supported yet — only external URLs.
export async function addMediaItemAction(
  folderId: string,
  _prev: AddItemState,
  formData: FormData,
): Promise<AddItemState> {
  const { role } = await requireRole("media");
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };

  const folder = await getMediaFolderById(folderId);
  if (!folder) return { ok: false, error: "Folder not found." };
  const me = await getCurrentDbUser();
  if (!me) return { ok: false, error: "Account lookup failed." };
  if (folder.ownerUserId !== me.id && role !== "admin" && role !== "it") {
    return { ok: false, error: "This folder belongs to another media user." };
  }

  const kind = String(formData.get("kind") ?? "image").trim();
  const url = String(formData.get("url") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();

  if (!url) return { ok: false, error: "Paste the URL." };
  if (!/^https?:\/\//i.test(url)) return { ok: false, error: "URL must start with http(s)://." };

  try {
    await insertMediaItem({
      folderId,
      uploadedBy: me.id,
      kind: kind || "image",
      url,
      title: title || null,
      caption: caption || null,
    });
  } catch (err) {
    console.error("[media/add-item] insert failed", err);
    return { ok: false, error: "Could not save the item. Try again." };
  }

  revalidatePath(`/dashboard/media/folders/${folderId}`);
  return { ok: true };
}

// Delete an item. Same authorisation: owner or admin/it.
export async function deleteMediaItemAction(folderId: string, itemId: string): Promise<void> {
  const { role } = await requireRole("media");
  if (!isDbConfigured()) return;
  const folder = await getMediaFolderById(folderId);
  if (!folder) return;
  const me = await getCurrentDbUser();
  if (!me) return;
  if (folder.ownerUserId !== me.id && role !== "admin" && role !== "it") return;
  await deleteMediaItem(itemId);
  revalidatePath(`/dashboard/media/folders/${folderId}`);
}

// Delete a folder (cascades to items via FK). Same authorisation.
export async function deleteMediaFolderAction(folderId: string): Promise<void> {
  const { role } = await requireRole("media");
  if (!isDbConfigured()) return;
  const folder = await getMediaFolderById(folderId);
  if (!folder) return;
  const me = await getCurrentDbUser();
  if (!me) return;
  if (folder.ownerUserId !== me.id && role !== "admin" && role !== "it") return;
  await deleteMediaFolder(folderId);
  revalidatePath("/dashboard/media");
}
