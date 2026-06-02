import "server-only";
import { and, desc, eq, gte, inArray } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { MentorCall } from "@/db/schema";
import { donations, mentorCalls, mentors, users } from "@/db/schema";

// Mentor reads calls for a single student (their dashboard's call log).
export async function listMentorCallsForStudent(studentSlug: string): Promise<MentorCall[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(mentorCalls)
    .where(eq(mentorCalls.studentSlug, studentSlug))
    .orderBy(desc(mentorCalls.calledAt));
}

export type StudentReport = MentorCall & { mentorName: string };

// Every report collected for a student, by ANY mentor (so a new mentor sees
// the full history their predecessors built). Joins through to the mentor's
// display name for attribution. Most-recent first.
export async function listStudentReportsWithMentor(studentSlug: string): Promise<StudentReport[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select({
      call: mentorCalls,
      displayName: users.displayName,
      email: users.email,
    })
    .from(mentorCalls)
    .leftJoin(mentors, eq(mentors.id, mentorCalls.mentorId))
    .leftJoin(users, eq(users.id, mentors.userId))
    .where(eq(mentorCalls.studentSlug, studentSlug))
    .orderBy(desc(mentorCalls.calledAt));
  return rows.map((r) => ({
    ...r.call,
    mentorName: r.displayName ?? r.email ?? "Unknown mentor",
  }));
}

// Mentor's full call log across all their assigned students. Used to drive
// the "recent calls" feed on the mentor dashboard.
export async function listMentorCallsForMentor(
  mentorId: string,
  limit = 100,
): Promise<MentorCall[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(mentorCalls)
    .where(eq(mentorCalls.mentorId, mentorId))
    .orderBy(desc(mentorCalls.calledAt))
    .limit(limit);
}

export async function insertMentorCall(args: {
  mentorId: string;
  studentSlug: string;
  calledAt: Date;
  nextCallDueAt: Date | null;
  answers: Record<string, string> | null;
  notes: string | null;
}): Promise<MentorCall | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db
    .insert(mentorCalls)
    .values({
      mentorId: args.mentorId,
      studentSlug: args.studentSlug,
      calledAt: args.calledAt,
      nextCallDueAt: args.nextCallDueAt,
      answers: args.answers ?? undefined,
      notes: args.notes,
    })
    .returning();
  return inserted[0] ?? null;
}

// PER-DONATION visibility: a donor sees calls for a student only on calls
// that happened AFTER one of their actual succeeded donations to that
// student. Not "ever donated" — the call must be inside the window where
// the donor was actively supporting them.
//
// This matches the user's clarification: "Mentor-call visibility query
// must be per-donation, not 'ever donated.'"
export async function listVisibleCallsForDonor(args: {
  donorUserId: string;
  studentSlug: string;
}): Promise<MentorCall[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();

  // Find the earliest succeeded donation by this donor to this student.
  // Calls after that date are visible. (We don't currently model "stopped
  // supporting" so the window stays open from first donation onward.)
  const firstGift = await db
    .select({ at: donations.occurredAt })
    .from(donations)
    .where(
      and(
        eq(donations.donorUserId, args.donorUserId),
        eq(donations.studentSlug, args.studentSlug),
        eq(donations.status, "succeeded"),
      ),
    )
    .orderBy(donations.occurredAt)
    .limit(1);

  if (firstGift.length === 0) return [];

  return db
    .select()
    .from(mentorCalls)
    .where(
      and(
        eq(mentorCalls.studentSlug, args.studentSlug),
        gte(mentorCalls.calledAt, firstGift[0].at),
      ),
    )
    .orderBy(desc(mentorCalls.calledAt));
}

// Report count per student slug — drives the admin student-profiles list
// without N+1 queries.
export async function countReportsByStudent(studentSlugs: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (!isDbConfigured() || studentSlugs.length === 0) return out;
  const db = getDb();
  const rows = await db
    .select({ slug: mentorCalls.studentSlug })
    .from(mentorCalls)
    .where(inArray(mentorCalls.studentSlug, studentSlugs));
  for (const r of rows) out.set(r.slug, (out.get(r.slug) ?? 0) + 1);
  return out;
}

// Bulk helper for the donor dashboard — given the donor's full list of
// supported students, return the most recent call per student (so we can
// surface "last call for {student}" without N+1 queries).
export async function latestCallByStudent(
  studentSlugs: string[],
): Promise<Map<string, MentorCall>> {
  const out = new Map<string, MentorCall>();
  if (!isDbConfigured() || studentSlugs.length === 0) return out;
  const db = getDb();
  const rows = await db
    .select()
    .from(mentorCalls)
    .where(inArray(mentorCalls.studentSlug, studentSlugs))
    .orderBy(desc(mentorCalls.calledAt));
  for (const r of rows) {
    if (!out.has(r.studentSlug)) out.set(r.studentSlug, r);
  }
  return out;
}
