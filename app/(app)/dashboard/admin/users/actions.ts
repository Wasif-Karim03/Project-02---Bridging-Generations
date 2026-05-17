"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getUserById, setUserRole } from "@/lib/db/queries/users";
import { sendMentorApprovalEmail } from "@/lib/notifications/mentorApproval";

export type RoleChangeResult = {
  status: "success" | "error";
  message: string;
};

// Promote / demote a user. Admin-only.
//
// On the non-mentor → mentor transition we fire a welcome email pointing at
// the mentor dashboard. Pairs with the student-approval email so every
// "you've been promoted" moment in the org has a parallel notification.
// Other role changes (donor↔admin, donor↔it, mentor demotion, etc.) don't
// trigger email — they're board-internal moves.
export async function setUserRoleAction(
  userId: string,
  role: "donor" | "mentor" | "admin" | "it" | "student",
): Promise<RoleChangeResult> {
  await requireRole("admin");
  try {
    const prev = await getUserById(userId);
    const wasMentor = prev?.role === "mentor";
    await setUserRole(userId, role);
    revalidatePath("/dashboard/admin/users");
    revalidatePath("/dashboard/admin/mentors");
    revalidatePath("/dashboard/mentor");

    if (role === "mentor" && !wasMentor && prev?.email) {
      // Fire-and-forget. Don't roll back the role change if email fails;
      // sendEmail logs to stderr in that case so ops can backfill manually.
      await sendMentorApprovalEmail({ email: prev.email, displayName: prev.displayName });
    }
    return { status: "success", message: `Role set to ${role}.` };
  } catch (err) {
    console.error("[admin/users/setRole] failed", err);
    return { status: "error", message: "Could not update role. Try again." };
  }
}
