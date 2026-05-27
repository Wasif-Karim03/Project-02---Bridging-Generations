"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { mentors } from "@/db/schema";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { insertMentorCall } from "@/lib/db/queries/mentorCalls";
import { nextCallDueFrom } from "@/lib/mentor/callCadence";
import { MENTOR_CALL_QUESTIONS } from "@/lib/mentor/callQuestions";

export type LogCallState = { ok: true } | { ok: false; error: string } | null;

export async function logMentorCallAction(
  _prev: LogCallState,
  formData: FormData,
): Promise<LogCallState> {
  await requireRole("mentor");
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };

  const me = await getCurrentDbUser();
  if (!me) return { ok: false, error: "Account lookup failed." };

  // Resolve mentor row (canonical mentors.id used by mentor_calls.mentorId).
  const db = getDb();
  const mentorRows = await db.select().from(mentors).where(eq(mentors.userId, me.id)).limit(1);
  const mentorRow = mentorRows[0];
  if (!mentorRow) {
    return {
      ok: false,
      error: "Your account isn't linked to a mentor record yet. Contact an admin.",
    };
  }

  const studentSlug = String(formData.get("studentSlug") ?? "").trim();
  const calledAtRaw = String(formData.get("calledAt") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!studentSlug) return { ok: false, error: "Pick the student you spoke with." };
  if (!calledAtRaw) return { ok: false, error: "Enter the call date." };

  const calledAt = new Date(calledAtRaw);
  if (Number.isNaN(calledAt.getTime())) {
    return { ok: false, error: "Could not parse the call date." };
  }

  const answers: Record<string, string> = {};
  for (const q of MENTOR_CALL_QUESTIONS) {
    const v = String(formData.get(`ans_${q.id}`) ?? "").trim();
    if (v) answers[q.id] = v;
  }

  try {
    await insertMentorCall({
      mentorId: mentorRow.id,
      studentSlug,
      calledAt,
      nextCallDueAt: nextCallDueFrom(calledAt),
      answers: Object.keys(answers).length > 0 ? answers : null,
      notes: notes || null,
    });
  } catch (err) {
    console.error("[mentor/log-call] insert failed", err);
    return { ok: false, error: "Could not save the call. Try again." };
  }

  redirect("/dashboard/mentor");
}
