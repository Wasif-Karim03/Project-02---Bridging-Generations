"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { setApplicationStatus } from "@/lib/db/queries/applications";
import { notifyApplicantOfDecision } from "@/lib/notifications/applicationDecision";
import type { ReviewActionState } from "./reviewState";

// NOTE: a "use server" file may ONLY export async functions. The shared
// ReviewActionState type lives in ./reviewState (a plain module) and the
// INITIAL_REVIEW_STATE constant is defined in the client component — exporting
// a non-function value from here throws "A 'use server' file can only export
// async functions" at runtime when the action module loads.

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
  // Whole body wrapped so NOTHING can reach the global error boundary — a
  // failure shows inline (with the real message, for diagnosis) instead of the
  // "Something went wrong" page. Next's own redirects are re-thrown so auth
  // still works.
  try {
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
    // Best-effort decision email to the applicant (never blocks the action).
    await notifyApplicantOfDecision(
      kind as ApplicationRow["kind"],
      id,
      nextStatus as ApplicationStatus,
    );
    return {
      status: "success",
      message: `Updated to ${nextStatus.replace(/_/g, " ")}.`,
    };
  } catch (err) {
    // Let Next's redirect/notFound control-flow errors propagate.
    const digest = (err as { digest?: unknown })?.digest;
    if (
      typeof digest === "string" &&
      (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
    ) {
      throw err;
    }
    console.error("[admin/submitApplicationReview] failed", err);
    return {
      status: "error",
      message: `Review failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
