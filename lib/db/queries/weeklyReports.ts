import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { WeeklyReport } from "@/db/schema";
import { mentorStudentAssignments, mentors, users, weeklyReports } from "@/db/schema";

export type WeeklyReportInput = {
  mentorUserId: string;
  studentSlug: string;
  weekOf: Date;
  attendance?: string;
  studyNotes?: string;
  actionItems?: string;
  attachmentUrl?: string;
};

/**
 * Insert a mentor's weekly report. Looks up the mentor record by user id;
 * returns null if no mentor row exists (user hasn't been promoted to mentor
 * yet) or if the DB isn't configured.
 */
export async function insertWeeklyReport(input: WeeklyReportInput): Promise<WeeklyReport | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const mentorRow = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.userId, input.mentorUserId))
    .limit(1);
  const mentor = mentorRow[0];
  if (!mentor) return null;
  const inserted = await db
    .insert(weeklyReports)
    .values({
      mentorId: mentor.id,
      studentSlug: input.studentSlug,
      weekOf: input.weekOf,
      attendance: input.attendance ?? null,
      studyNotes: input.studyNotes ?? null,
      actionItems: input.actionItems ?? null,
      attachmentUrl: input.attachmentUrl ?? null,
    })
    .returning();
  return inserted[0] ?? null;
}

/**
 * Return the mentor's recent reports across all their assigned students.
 * Empty list when the DB isn't configured or the user isn't a mentor.
 */
export async function getRecentReportsForMentor(
  mentorUserId: string,
  limit = 50,
): Promise<WeeklyReport[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const mentorRow = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.userId, mentorUserId))
    .limit(1);
  const mentor = mentorRow[0];
  if (!mentor) return [];
  return db
    .select()
    .from(weeklyReports)
    .where(eq(weeklyReports.mentorId, mentor.id))
    .orderBy(desc(weeklyReports.weekOf))
    .limit(limit);
}

/**
 * Active student assignments for a mentor. Used by the mentor dashboard to
 * render the list of students they're paired with.
 */
export async function getAssignmentsForMentor(mentorUserId: string): Promise<string[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const mentorRow = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.userId, mentorUserId))
    .limit(1);
  const mentor = mentorRow[0];
  if (!mentor) return [];
  const rows = await db
    .select({ studentSlug: mentorStudentAssignments.studentSlug })
    .from(mentorStudentAssignments)
    .where(and(eq(mentorStudentAssignments.mentorId, mentor.id)));
  return rows.map((r) => r.studentSlug);
}

export type StudentMentorAssignment = {
  mentorName: string;
  assignedAt: Date;
  endedAt: Date | null;
};

// Admin-facing: which mentor(s) are (or were) assigned to a student, with the
// mentor's display name. Active assignments (endedAt null) first.
export async function listMentorsForStudent(
  studentSlug: string,
): Promise<StudentMentorAssignment[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select({
      assignedAt: mentorStudentAssignments.assignedAt,
      endedAt: mentorStudentAssignments.endedAt,
      displayName: users.displayName,
      email: users.email,
    })
    .from(mentorStudentAssignments)
    .leftJoin(mentors, eq(mentors.id, mentorStudentAssignments.mentorId))
    .leftJoin(users, eq(users.id, mentors.userId))
    .where(eq(mentorStudentAssignments.studentSlug, studentSlug))
    .orderBy(desc(mentorStudentAssignments.assignedAt));
  return rows.map((r) => ({
    mentorName: r.displayName ?? r.email ?? "Unknown mentor",
    assignedAt: r.assignedAt,
    endedAt: r.endedAt,
  }));
}

/**
 * Most recent mentor report per student, keyed by studentSlug. Used by the
 * donor dashboard to show donors when their sponsored student was last
 * checked in on by a mentor. Returns an empty object in preview mode.
 */
export async function getLatestReportPerStudent(
  studentSlugs: string[],
): Promise<Record<string, { weekOf: Date; attendance: string | null } | undefined>> {
  if (!isDbConfigured() || studentSlugs.length === 0) return {};
  const db = getDb();
  // Pull every report for these students, ordered desc by weekOf, then keep
  // only the first one per slug. For a small org this is fine; if reports
  // grow large we can switch to a DISTINCT ON query.
  const rows = await db
    .select({
      studentSlug: weeklyReports.studentSlug,
      weekOf: weeklyReports.weekOf,
      attendance: weeklyReports.attendance,
    })
    .from(weeklyReports)
    .orderBy(desc(weeklyReports.weekOf));
  const map: Record<string, { weekOf: Date; attendance: string | null }> = {};
  for (const r of rows) {
    if (!studentSlugs.includes(r.studentSlug)) continue;
    if (!map[r.studentSlug]) {
      map[r.studentSlug] = { weekOf: r.weekOf, attendance: r.attendance };
    }
  }
  return map;
}

/**
 * Get-or-create the mentors row for a user. Called when an admin first
 * touches a mentor (assign students, edit bio). New mentors don't get a
 * mentors row at role-promotion time; this lazy upsert avoids needing an
 * explicit "create mentor" step.
 */
export async function getOrCreateMentor(mentorUserId: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const existing = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.userId, mentorUserId))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const inserted = await db
    .insert(mentors)
    .values({ userId: mentorUserId })
    .returning({ id: mentors.id });
  return inserted[0]?.id ?? null;
}

/**
 * Stop (endedAt = now) or reinstate (endedAt = null) a mentor's mentorship.
 * Creates the mentors row if needed so the admin can stop a freshly-approved
 * mentor too.
 */
export async function setMentorEndedAt(mentorUserId: string, endedAt: Date | null): Promise<void> {
  if (!isDbConfigured()) return;
  await getOrCreateMentor(mentorUserId);
  const db = getDb();
  await db.update(mentors).set({ endedAt }).where(eq(mentors.userId, mentorUserId));
}

/**
 * Assign a student (by Keystatic slug) to a mentor. Idempotent — the
 * primary key on (mentorId, studentSlug) prevents duplicates; we catch and
 * swallow the unique-violation case.
 */
export async function assignStudentToMentor(
  mentorUserId: string,
  studentSlug: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  const mentorId = await getOrCreateMentor(mentorUserId);
  if (!mentorId) return;
  const db = getDb();
  try {
    await db.insert(mentorStudentAssignments).values({ mentorId, studentSlug });
  } catch (err) {
    // Unique-violation on (mentorId, studentSlug) — already assigned. Safe.
    if (!String(err).includes("duplicate key")) throw err;
  }
}

/**
 * Remove a student-mentor pairing.
 */
export async function unassignStudentFromMentor(
  mentorUserId: string,
  studentSlug: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  const mentorRow = await db
    .select({ id: mentors.id })
    .from(mentors)
    .where(eq(mentors.userId, mentorUserId))
    .limit(1);
  const mentor = mentorRow[0];
  if (!mentor) return;
  await db
    .delete(mentorStudentAssignments)
    .where(
      and(
        eq(mentorStudentAssignments.mentorId, mentor.id),
        eq(mentorStudentAssignments.studentSlug, studentSlug),
      ),
    );
}
