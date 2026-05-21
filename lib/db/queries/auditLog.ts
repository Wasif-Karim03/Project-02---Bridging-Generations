import "server-only";
import { desc, eq, isNotNull } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import {
  mentorApplications,
  scholarshipApplications,
  studentRegistrations,
  users,
} from "@/db/schema";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";

export type ReviewAuditEntry = {
  /** Composite key for React: `${kind}:${applicationId}` */
  key: string;
  kind: ApplicationRow["kind"];
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  reviewedAt: Date;
  reviewedByEmail: string | null;
  reviewedByDisplayName: string | null;
  status: ApplicationStatus;
  reviewerNotes: string | null;
};

/** Merged feed of every application review across the three kinds, newest
 * first. Drives the /dashboard/admin/audit page. Only includes rows that
 * have actually been reviewed (reviewedAt + reviewedBy populated) — fresh
 * submissions with no admin action yet aren't part of the audit trail. */
export async function getRecentReviewActivity(limit = 100): Promise<ReviewAuditEntry[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();

  const [scholarships, mentorRows, studentRows] = await Promise.all([
    db
      .select({
        applicationId: scholarshipApplications.id,
        applicantName: scholarshipApplications.applicantName,
        applicantEmail: scholarshipApplications.email,
        reviewedAt: scholarshipApplications.reviewedAt,
        status: scholarshipApplications.status,
        reviewerNotes: scholarshipApplications.reviewerNotes,
        reviewedByEmail: users.email,
        reviewedByDisplayName: users.displayName,
      })
      .from(scholarshipApplications)
      .leftJoin(users, eq(scholarshipApplications.reviewedBy, users.id))
      .where(isNotNull(scholarshipApplications.reviewedAt))
      .orderBy(desc(scholarshipApplications.reviewedAt))
      .limit(limit),
    db
      .select({
        applicationId: mentorApplications.id,
        applicantName: mentorApplications.name,
        applicantEmail: mentorApplications.email,
        reviewedAt: mentorApplications.reviewedAt,
        status: mentorApplications.status,
        reviewerNotes: mentorApplications.reviewerNotes,
        reviewedByEmail: users.email,
        reviewedByDisplayName: users.displayName,
      })
      .from(mentorApplications)
      .leftJoin(users, eq(mentorApplications.reviewedBy, users.id))
      .where(isNotNull(mentorApplications.reviewedAt))
      .orderBy(desc(mentorApplications.reviewedAt))
      .limit(limit),
    db
      .select({
        applicationId: studentRegistrations.id,
        applicantName: studentRegistrations.studentName,
        applicantEmail: studentRegistrations.email,
        reviewedAt: studentRegistrations.reviewedAt,
        status: studentRegistrations.status,
        reviewerNotes: studentRegistrations.reviewerNotes,
        reviewedByEmail: users.email,
        reviewedByDisplayName: users.displayName,
      })
      .from(studentRegistrations)
      .leftJoin(users, eq(studentRegistrations.reviewedBy, users.id))
      .where(isNotNull(studentRegistrations.reviewedAt))
      .orderBy(desc(studentRegistrations.reviewedAt))
      .limit(limit),
  ]);

  const merged: ReviewAuditEntry[] = [
    ...scholarships.map((r) => buildEntry("scholarship", r)),
    ...mentorRows.map((r) => buildEntry("mentor", r)),
    ...studentRows.map((r) => buildEntry("student-sponsorship", r)),
  ];

  return merged.sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime()).slice(0, limit);
}

function buildEntry(
  kind: ApplicationRow["kind"],
  r: {
    applicationId: string;
    applicantName: string;
    applicantEmail: string | null;
    reviewedAt: Date | null;
    status: ApplicationStatus;
    reviewerNotes: string | null;
    reviewedByEmail: string | null;
    reviewedByDisplayName: string | null;
  },
): ReviewAuditEntry {
  return {
    key: `${kind}:${r.applicationId}`,
    kind,
    applicationId: r.applicationId,
    applicantName: r.applicantName,
    applicantEmail: r.applicantEmail ?? "—",
    // isNotNull filter guarantees this is non-null, but TS doesn't infer it.
    reviewedAt: r.reviewedAt as Date,
    status: r.status,
    reviewerNotes: r.reviewerNotes,
    reviewedByEmail: r.reviewedByEmail,
    reviewedByDisplayName: r.reviewedByDisplayName,
  };
}
