"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { setApplicationStatus } from "@/lib/db/queries/applications";

export type ReviewActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const INITIAL_REVIEW_STATE: ReviewActionState = { status: "idle", message: "" };

const VALID_KINDS: ReadonlyArray<ApplicationRow["kind"]> = [
  "scholarship",
  "mentor",
  "student-sponsorship",
];
const VALID_STATUSES: ReadonlyArray<ApplicationStatus> = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
];

/** Server action wired to the ReviewControls form on the detail page.
 * Updates status + (where supported) reviewer notes, then revalidates the
 * admin overview and this detail page so both views reflect the new state. */
export async function submitApplicationReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  await requireRole("admin");
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return {
      status: "error",
      message: "Could not identify the reviewer. Sign out and back in, then retry.",
    };
  }

  const kind = String(formData.get("kind") ?? "");
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!VALID_KINDS.includes(kind as ApplicationRow["kind"])) {
    return { status: "error", message: "Unknown application kind." };
  }
  if (!VALID_STATUSES.includes(nextStatus as ApplicationStatus)) {
    return { status: "error", message: "Invalid status selection." };
  }
  if (!id) {
    return { status: "error", message: "Missing application id." };
  }

  try {
    await setApplicationStatus(
      kind as ApplicationRow["kind"],
      id,
      nextStatus as ApplicationStatus,
      {
        reviewedBy: dbUser.id,
        reviewerNotes: notes,
      },
    );
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/admin/applications");
    revalidatePath(`/dashboard/admin/applications/${kind}/${id}`);
    return {
      status: "success",
      message: `Updated to ${nextStatus.replace(/_/g, " ")}.`,
    };
  } catch (err) {
    console.error("[admin/submitApplicationReview] failed", err);
    return {
      status: "error",
      message: "Could not save the review. Try again in a moment.",
    };
  }
}
