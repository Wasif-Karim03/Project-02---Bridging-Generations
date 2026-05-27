"use server";

import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { insertMediaFolder } from "@/lib/db/queries/mediaFolders";

export type NewFolderState = { ok: true } | { ok: false; error: string } | null;

export async function createMediaFolderAction(
  _prev: NewFolderState,
  formData: FormData,
): Promise<NewFolderState> {
  await requireRole("media");
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };

  const owner = await getCurrentDbUser();
  if (!owner) return { ok: false, error: "Account lookup failed." };

  const name = String(formData.get("name") ?? "").trim();
  const eventName = String(formData.get("eventName") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { ok: false, error: "Give the folder a name." };

  let folderId: string | null = null;
  try {
    const inserted = await insertMediaFolder({
      ownerUserId: owner.id,
      name,
      eventName: eventName || null,
      eventDate: eventDate || null,
      description: description || null,
    });
    folderId = inserted?.id ?? null;
  } catch (err) {
    console.error("[media/new-folder] insert failed", err);
    return { ok: false, error: "Could not create the folder. Try again." };
  }

  if (folderId) redirect(`/dashboard/media/folders/${folderId}`);
  redirect("/dashboard/media");
}
