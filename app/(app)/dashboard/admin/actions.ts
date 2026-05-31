"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { setApplicationStatus } from "@/lib/db/queries/applications";
import { notifyApplicantOfDecision } from "@/lib/notifications/applicationDecision";

export type ApprovalResult = {
  status: "success" | "error";
  message: string;
};

// Approve / reject / mark in-review on any application kind. Admin-only.
// In preview mode (no DB) this is a no-op success — the mock data isn't
// mutable, but the UI confirms the would-be action.
export async function setApplicationStatusAction(
  kind: ApplicationRow["kind"],
  id: string,
  status: ApplicationStatus,
  reviewerNotes?: string,
): Promise<ApprovalResult> {
  await requireRole("admin");
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return {
      status: "error",
      message: "Could not identify the reviewer. Sign out and back in, then retry.",
    };
  }
  try {
    await setApplicationStatus(kind, id, status, {
      reviewedBy: dbUser.id,
      reviewerNotes,
    });
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/applications");
    await notifyApplicantOfDecision(kind, id, status);
    return {
      status: "success",
      message: `Application marked ${status.replace(/_/g, " ")}.`,
    };
  } catch (err) {
    console.error("[admin/setApplicationStatus] failed", err);
    return {
      status: "error",
      message: "Could not update the application. Try again.",
    };
  }
}
