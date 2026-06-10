"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { deleteGalleryImage } from "@/lib/db/queries/gallery";

export async function deleteGalleryImageAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await deleteGalleryImage(id);
  revalidatePath("/dashboard/admin/gallery");
  revalidatePath("/gallery");
}
