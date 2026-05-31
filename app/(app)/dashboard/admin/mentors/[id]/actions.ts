"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getUserById, setUserStatus } from "@/lib/db/queries/users";
import {
  assignStudentToMentor,
  setMentorEndedAt,
  unassignStudentFromMentor,
} from "@/lib/db/queries/weeklyReports";
import { sendEmail } from "@/lib/forms/server";

type ActionResult = { ok: true } | { ok: false; error: string };

// Stop an active mentorship: mark the mentors row ended and suspend the
// account so they lose mentor access. Reversible via reinstateMentorshipAction.
export async function stopMentorshipAction(mentorUserId: string): Promise<ActionResult> {
  await requireRole("admin");
  try {
    await setMentorEndedAt(mentorUserId, new Date());
    await setUserStatus(mentorUserId, "suspended");
    revalidatePath(`/dashboard/admin/mentors/${mentorUserId}`);
    revalidatePath("/dashboard/admin/mentors");
    const user = await getUserById(mentorUserId);
    if (user?.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: "Your Bridging Generations mentorship has been paused",
          text: [
            `Hi ${user.displayName ?? "there"},`,
            "",
            "Your mentorship with Bridging Generations has been paused by the board. If you",
            "think this is a mistake or you'd like to discuss it, just reply to this email.",
            "",
            "— Bridging Generations",
          ].join("\n"),
        });
      } catch (err) {
        console.error("[admin/mentors/stop] email failed (status still updated)", err);
      }
    }
    return { ok: true };
  } catch (err) {
    console.error("[admin/mentors/stop] failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not stop mentorship." };
  }
}

// Reinstate a previously-stopped mentorship.
export async function reinstateMentorshipAction(mentorUserId: string): Promise<ActionResult> {
  await requireRole("admin");
  try {
    await setMentorEndedAt(mentorUserId, null);
    await setUserStatus(mentorUserId, "active");
    revalidatePath(`/dashboard/admin/mentors/${mentorUserId}`);
    revalidatePath("/dashboard/admin/mentors");
    return { ok: true };
  } catch (err) {
    console.error("[admin/mentors/reinstate] failed", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not reinstate mentorship.",
    };
  }
}

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
