"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { assignStudentToMentor, unassignStudentFromMentor } from "@/lib/db/queries/weeklyReports";

export async function assignStudentAction(
  mentorUserId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  const studentSlug = String(formData.get("studentSlug") ?? "").trim();
  if (!studentSlug) return { ok: false, error: "Pick a student." };
  try {
    await assignStudentToMentor(mentorUserId, studentSlug);
    revalidatePath(`/dashboard/admin/mentors/${mentorUserId}`);
    revalidatePath("/dashboard/admin/mentors");
    return { ok: true };
  } catch (err) {
    console.error("[admin/mentors/assign] failed", err);
    return { ok: false, error: "Could not assign student." };
  }
}

export async function unassignStudentAction(
  mentorUserId: string,
  studentSlug: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  if (!studentSlug) return { ok: false, error: "Invalid student." };
  try {
    await unassignStudentFromMentor(mentorUserId, studentSlug);
    revalidatePath(`/dashboard/admin/mentors/${mentorUserId}`);
    revalidatePath("/dashboard/admin/mentors");
    return { ok: true };
  } catch (err) {
    console.error("[admin/mentors/unassign] failed", err);
    return { ok: false, error: "Could not remove assignment." };
  }
}
