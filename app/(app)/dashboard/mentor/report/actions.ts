"use server";

import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/db/client";
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
    // requireRole("mentor") already resolves (and JIT-creates) the local users
    // row, so in DB mode this lookup succeeds. If it somehow doesn't, bail
    // loudly instead of writing a row keyed off the wrong id.
    const localUser = await getUserByClerkId(clerkUserId);
    if (!localUser && isDbConfigured()) {
      return {
        status: "error",
        message: "Your account isn't fully set up yet. Please refresh and try again.",
      };
    }

    const report = await insertWeeklyReport({
      mentorUserId: localUser?.id ?? clerkUserId,
      studentSlug: payload.studentSlug,
      weekOf,
      attendance: payload.attendance,
      studyNotes: payload.studyNotes,
      actionItems: payload.actionItems,
    });

    // insertWeeklyReport returns null (without throwing) when there's no
    // matching `mentors` row — e.g. the user got the mentor role directly
    // rather than through the application-approval path that creates it.
    // Surface that instead of falsely reporting success and dropping the
    // report. In preview mode (no DB) the null is expected, so let it pass.
    if (!report && isDbConfigured()) {
      return {
        status: "error",
        message: "No mentor profile is linked to your account yet. Contact an admin.",
      };
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
