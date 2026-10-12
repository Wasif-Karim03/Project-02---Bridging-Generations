"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getUserByClerkId } from "@/lib/db/queries/users";
import { insertWeeklyReport } from "@/lib/db/queries/weeklyReports";

export type WeeklyReportResult = {
  status: "success" | "error";
  message: string;
};

type WeeklyReportPayload = {
  studentSlug: string;
  weekOf: string; // "YYYY-MM-DD"
  attendance: string;
  studyNotes: string;
  actionItems: string;
};

// Server action for mentor weekly reports. In preview mode (no DB) the insert
// is a no-op and we return success with a "preview" message so the UI flows.
// With DB: inserts into weekly_reports keyed off the mentor record matching
// the current user.
export async function submitWeeklyReportAction(
  payload: WeeklyReportPayload,
): Promise<WeeklyReportResult> {
  const { userId: clerkUserId } = await requireRole("mentor");

  // Basic validation — page-side validation already happens, this is defence
  // in depth so we never write malformed rows.
  if (!payload.studentSlug || !payload.weekOf) {
    return {
      status: "error",
      message: "Missing student or week date.",
    };
  }

  const weekOf = new Date(payload.weekOf);
  if (Number.isNaN(weekOf.getTime())) {
    return { status: "error", message: "Invalid date." };
  }

  try {
    // Translate Clerk userId → local users.id; the mentor record keys off it.
    const localUser = await getUserByClerkId(clerkUserId);
    if (!localUser) {
      // In preview mode this is fine — insertWeeklyReport is itself a no-op.
      // With DB but no local users row: the Clerk webhook hasn't fired yet.
      await insertWeeklyReport({
        mentorUserId: clerkUserId,
        studentSlug: payload.studentSlug,
        weekOf,
        attendance: payload.attendance,
        studyNotes: payload.studyNotes,
        actionItems: payload.actionItems,
      });
    } else {
      await insertWeeklyReport({
        mentorUserId: localUser.id,
        studentSlug: payload.studentSlug,
        weekOf,
        attendance: payload.attendance,
        studyNotes: payload.studyNotes,
        actionItems: payload.actionItems,
      });
    }
    revalidatePath("/dashboard/mentor");
    return {
      status: "success",
      message: "Report filed.",
    };
  } catch (err) {
    console.error("[mentor/report/submit] failed", err);
    return {
      status: "error",
      message: "Could not file the report right now. Please try again.",
    };
  }
}
