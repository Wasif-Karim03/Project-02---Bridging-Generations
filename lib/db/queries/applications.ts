import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { MentorApplication, ScholarshipApplication, StudentRegistration } from "@/db/schema";
import {
  mentorApplications,
  mentors,
  scholarshipApplications,
  studentRegistrations,
  users,
} from "@/db/schema";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { MOCK_APPLICATIONS } from "@/lib/content/applicationsMock";

/** Discriminated union of one full application row, fetched for the admin
 * detail page. Each variant carries the raw row so the page can render every
 * field on the table — none of the summarisation that `getAllApplications`
 * does for the list view. */
export type ApplicationDetail =
  | { kind: "scholarship"; data: ScholarshipApplication }
  | { kind: "mentor"; data: MentorApplication }
  | { kind: "student-sponsorship"; data: StudentRegistration };

/** Fetch one application by (kind, id) for the admin review page. Returns
 * null when the kind is unknown, the row doesn't exist, or the DB isn't
 * configured (preview mode). */
export async function getApplicationById(
  kind: ApplicationRow["kind"],
  id: string,
): Promise<ApplicationDetail | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  if (kind === "scholarship") {
    const rows = await db
      .select()
      .from(scholarshipApplications)
      .where(eq(scholarshipApplications.id, id))
      .limit(1);
    return rows[0] ? { kind, data: rows[0] } : null;
  }
  if (kind === "mentor") {
    const rows = await db
      .select()
      .from(mentorApplications)
      .where(eq(mentorApplications.id, id))
      .limit(1);
    return rows[0] ? { kind, data: rows[0] } : null;
  }
  if (kind === "student-sponsorship") {
    const rows = await db
      .select()
      .from(studentRegistrations)
      .where(eq(studentRegistrations.id, id))
      .limit(1);
    return rows[0] ? { kind, data: rows[0] } : null;
  }
  return null;
}

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

// Update status + review trail on any application kind. We accept the kind
// explicitly to avoid a 3-way lookup; the admin UI passes it from the row.
// reviewedBy is the DB user.id of the admin making the change — required when
// the DB is configured so the audit trail isn't anonymous. Notes are
// optional; pass undefined or "" to clear them.
export async function setApplicationStatus(
  kind: ApplicationRow["kind"],
  id: string,
  status: ApplicationStatus,
  args: { reviewedBy: string; reviewerNotes?: string },
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  const reviewedAt = new Date();
  const notes = args.reviewerNotes?.trim() || null;
  if (kind === "scholarship") {
    await db
      .update(scholarshipApplications)
      .set({
        status,
        reviewerNotes: notes,
        reviewedAt,
        reviewedBy: args.reviewedBy,
      })
      .where(eq(scholarshipApplications.id, id));
  } else if (kind === "mentor") {
    await db
      .update(mentorApplications)
      .set({
        status,
        reviewerNotes: notes,
        reviewedAt,
        reviewedBy: args.reviewedBy,
        // approvedAt is the "became a mentor" timestamp; only set it when we
        // flip to approved, clear it otherwise (re-rejection scenario).
        approvedAt: status === "approved" ? reviewedAt : null,
      })
      .where(eq(mentorApplications.id, id));
    // On approve, try to auto-link the application to a user account and
    // promote them to the mentor role. No-op if the applicant hasn't signed
    // up yet — admin can promote them by hand once they do.
    if (status === "approved") {
      await autoPromoteMentorIfPossible(id);
    }
  } else if (kind === "student-sponsorship") {
    await db
      .update(studentRegistrations)
      .set({
        status,
        reviewerNotes: notes,
        reviewedAt,
        reviewedBy: args.reviewedBy,
      })
      .where(eq(studentRegistrations.id, id));
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

/** When an admin approves a mentor application, try to flip the matching
 * user account's role to "mentor" and create the canonical `mentors` row.
 * No-op when:
 *   - the applicant hasn't signed up yet (no user with that email)
 *   - the user is already mentor / admin / it / student (don't downgrade or
 *     re-overwrite roles we shouldn't touch)
 *
 * Admin can always promote manually from /dashboard/admin/users if this
 * helper bails out. */
async function autoPromoteMentorIfPossible(applicationId: string): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();

  const appRows = await db
    .select({ email: mentorApplications.email })
    .from(mentorApplications)
    .where(eq(mentorApplications.id, applicationId))
    .limit(1);
  const applicantEmail = appRows[0]?.email;
  if (!applicantEmail) return;

  const userRows = await db.select().from(users).where(eq(users.email, applicantEmail)).limit(1);
  const user = userRows[0];
  if (!user) return;

  // Only promote from donor/anonymous. Admin/it/student stay where they are;
  // an existing mentor doesn't need re-promotion. The mentor application
  // record still gets approvedUserId linked below for everyone.
  const promotable = user.role === "donor" || user.role === "anonymous";
  if (promotable) {
    await db
      .update(users)
      .set({ role: "mentor", updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  // Link the application to the user (one-time idempotent set).
  await db
    .update(mentorApplications)
    .set({ approvedUserId: user.id })
    .where(eq(mentorApplications.id, applicationId));

  // Canonical mentors row. The (userId) column is unique, so re-approving an
  // existing mentor is a no-op via onConflictDoNothing.
  await db
    .insert(mentors)
    .values({ userId: user.id, applicationId, bio: null })
    .onConflictDoNothing({ target: mentors.userId });
}
