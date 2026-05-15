"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { setUserStudentSlug } from "@/lib/db/queries/users";

export async function adminLinkStudentSlugAction(
  userId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  const slug = String(formData.get("studentSlug") ?? "")
    .trim()
    .slice(0, 80);
  try {
    await setUserStudentSlug(userId, slug || null);
    revalidatePath("/dashboard/admin/students");
    revalidatePath(`/dashboard/student`);
    return { ok: true };
  } catch (err) {
    console.error("[admin/students/link] failed", err);
    return { ok: false, error: "Could not update the link." };
  }
}
