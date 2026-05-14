import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { WeeklyReport } from "@/db/schema";
import { mentorStudentAssignments, mentors, weeklyReports } from "@/db/schema";

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
