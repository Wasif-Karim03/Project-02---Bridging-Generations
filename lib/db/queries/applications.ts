import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { StudentRegistration } from "@/db/schema";
import { mentorApplications, scholarshipApplications, studentRegistrations } from "@/db/schema";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { MOCK_APPLICATIONS } from "@/lib/content/applicationsMock";

/**
 * Most recent student registration submitted by a given user. Drives the
 * /dashboard/student page's "application pending" / "approved" state.
 */
export async function getLatestStudentRegistrationForUser(
  userId: string,
): Promise<StudentRegistration | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(studentRegistrations)
    .where(eq(studentRegistrations.applicantUserId, userId))
    .orderBy(desc(studentRegistrations.submittedAt))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Set the latest student registration's review state for a given applicant.
 * Used by the admin reject / approve actions to capture who decided, when,
 * and (for rejections) why. Returns true on update, false in preview mode
 * or when no registration exists.
 */
export async function setLatestStudentRegistrationStatus(args: {
  applicantUserId: string;
  status: ApplicationStatus;
  reviewedBy: string;
  notes?: string | null;
}): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const db = getDb();
  const latest = await db
    .select({ id: studentRegistrations.id })
    .from(studentRegistrations)
    .where(eq(studentRegistrations.applicantUserId, args.applicantUserId))
    .orderBy(desc(studentRegistrations.submittedAt))
    .limit(1);
  const row = latest[0];
  if (!row) return false;
  await db
    .update(studentRegistrations)
    .set({
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: new Date(),
      reviewerNotes: args.notes ?? null,
    })
    .where(eq(studentRegistrations.id, row.id));
  return true;
}

/**
 * Merged feed of every application kind, newest first. Drives the admin
 * dashboard queue. Falls back to mock data when the DB isn't configured.
 */
export async function getAllApplications(): Promise<ApplicationRow[]> {
  if (!isDbConfigured()) return MOCK_APPLICATIONS;
  const db = getDb();

  const [scholarships, mentors, students] = await Promise.all([
    db
      .select()
      .from(scholarshipApplications)
      .orderBy(desc(scholarshipApplications.submittedAt))
      .limit(200),
    db.select().from(mentorApplications).orderBy(desc(mentorApplications.submittedAt)).limit(200),
    db
      .select()
      .from(studentRegistrations)
      .orderBy(desc(studentRegistrations.submittedAt))
      .limit(200),
  ]);

  const merged: ApplicationRow[] = [
    ...scholarships.map<ApplicationRow>((r) => ({
      id: r.id,
      kind: "scholarship",
      submittedAt: r.submittedAt,
      applicantName: r.applicantName,
      email: r.email,
      summary: `Grade ${r.grade} at ${r.school}${r.village ? ` · ${r.village}` : ""}`,
      status: r.status,
    })),
    ...mentors.map<ApplicationRow>((r) => ({
      id: r.id,
      kind: "mentor",
      submittedAt: r.submittedAt,
      applicantName: r.name,
      email: r.email,
      summary: `Subjects: ${r.subjects.slice(0, 80)}${r.hoursPerWeek ? ` · ${r.hoursPerWeek} hrs/wk` : ""}`,
      status: r.status,
    })),
    ...students.map<ApplicationRow>((r) => ({
      id: r.id,
      kind: "student-sponsorship",
      submittedAt: r.submittedAt,
      applicantName: r.studentName,
      email: r.email ?? "—",
      summary: `Grade ${r.grade} at ${r.school}${r.isOrphan ? " · orphan" : ""}`,
      status: r.status,
    })),
  ];

  return merged.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

// Update status on any application kind. We accept the kind explicitly to
// avoid a 3-way lookup; the admin UI passes it from the row.
export async function setApplicationStatus(
  kind: ApplicationRow["kind"],
  id: string,
  status: ApplicationStatus,
  reviewerNotes?: string,
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  const reviewedAt = new Date();
  if (kind === "scholarship") {
    await db
      .update(scholarshipApplications)
      .set({ status, reviewerNotes: reviewerNotes ?? null, reviewedAt })
      .where(eq(scholarshipApplications.id, id));
  } else if (kind === "mentor") {
    await db
      .update(mentorApplications)
      .set({
        status,
        approvedAt: status === "approved" ? reviewedAt : null,
      })
      .where(eq(mentorApplications.id, id));
  } else if (kind === "student-sponsorship") {
    await db.update(studentRegistrations).set({ status }).where(eq(studentRegistrations.id, id));
  }
}

// Insert helpers — invoked by the application form server actions.

type InsertScholarshipPayload = {
  applicantName: string;
  guardianName?: string;
  email: string;
  phone?: string;
  school: string;
  grade: string;
  village?: string;
  region?: string;
  familyIncome?: string;
  message: string;
};

export async function insertScholarshipApplication(
  p: InsertScholarshipPayload,
): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db
    .insert(scholarshipApplications)
    .values({
      applicantName: p.applicantName,
      guardianName: p.guardianName ?? null,
      email: p.email,
      phone: p.phone ?? null,
      school: p.school,
      grade: p.grade,
      village: p.village ?? null,
      region: p.region ?? null,
      familyIncome: p.familyIncome ?? null,
      message: p.message,
    })
    .returning({ id: scholarshipApplications.id });
  return inserted[0]?.id ?? null;
}

type InsertMentorPayload = {
  name: string;
  email: string;
  country?: string;
  occupation?: string;
  educationStatus?: string;
  subjects: string;
  hoursPerWeek?: string;
  startTerm?: string;
  whyMentor: string;
};

export async function insertMentorApplication(p: InsertMentorPayload): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db
    .insert(mentorApplications)
    .values({
      name: p.name,
      email: p.email,
      country: p.country ?? null,
      occupation: p.occupation ?? null,
      educationStatus: p.educationStatus ?? null,
      subjects: p.subjects,
      hoursPerWeek: p.hoursPerWeek ?? null,
      startTerm: p.startTerm ?? null,
      whyMentor: p.whyMentor,
    })
    .returning({ id: mentorApplications.id });
  return inserted[0]?.id ?? null;
}

type InsertStudentRegistrationPayload = {
  studentName: string;
  dateOfBirth?: string;
  grade: string;
  school: string;
  ethnicity?: string;
  isOrphan: boolean;
  guardianName: string;
  guardianRelation?: string;
  guardianOccupation?: string;
  familyIncome?: string;
  address: string;
  phone?: string;
  email?: string;
  message?: string;
};

export async function insertStudentRegistration(
  p: InsertStudentRegistrationPayload,
): Promise<string | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db
    .insert(studentRegistrations)
    .values({
      studentName: p.studentName,
      dateOfBirth: p.dateOfBirth ?? null,
      grade: p.grade,
      school: p.school,
      ethnicity: p.ethnicity ?? null,
      isOrphan: p.isOrphan,
      guardianName: p.guardianName,
      guardianRelation: p.guardianRelation ?? null,
      guardianOccupation: p.guardianOccupation ?? null,
      familyIncome: p.familyIncome ?? null,
      address: p.address,
      phone: p.phone ?? null,
      email: p.email ?? null,
      message: p.message ?? null,
    })
    .returning({ id: studentRegistrations.id });
  return inserted[0]?.id ?? null;
}
