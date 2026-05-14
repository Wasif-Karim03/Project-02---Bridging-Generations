"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { setApplicationStatus } from "@/lib/db/queries/applications";

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
  try {
    await setApplicationStatus(kind, id, status, reviewerNotes);
    revalidatePath("/dashboard/admin");
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
