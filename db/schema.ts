import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// =============================================================================
// Bridging Generations — application-side schema (Phase 4)
//
// Run migrations once Neon Postgres is provisioned and DATABASE_URL is set in
// Vercel. Until then, this schema is just a code definition — nothing imports
// from a live connection.
//
// drizzle-kit generate:pg  --schema=./db/schema.ts --out=./db/migrations
// drizzle-kit push:pg      --schema=./db/schema.ts
// =============================================================================

// ---------- Enums ----------

export const userRoleEnum = pgEnum("user_role", [
  "anonymous",
  "donor",
  "mentor",
  "admin",
  "it",
  "student",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
]);

export const donationStatusEnum = pgEnum("donation_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const donationSourceEnum = pgEnum("donation_source", ["stripe", "bkash", "manual"]);

// ---------- Users ----------
// Clerk owns the auth records; we mirror userId here as the canonical link.
// Roles (admin/donor/mentor/it) live in this table so we don't need a Clerk
// org for them.

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 64 }).notNull().unique(),
    role: userRoleEnum("role").notNull().default("anonymous"),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 120 }),
    // For accounts with role=student. Links the account to a Keystatic
    // student record (content/students/<slug>/) so the dashboard can pull
    // their public profile and the donations attributed to their slug.
    // Admin sets this on approval; null until then ("application pending").
    studentSlug: varchar("student_slug", { length: 80 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byEmail: index("users_email_idx").on(t.email),
    byStudentSlug: index("users_student_slug_idx").on(t.studentSlug),
  }),
);

// ---------- Donor profiles ----------

export const donorProfiles = pgTable("donor_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  photoUrl: varchar("photo_url", { length: 512 }),
  dedicationText: varchar("dedication_text", { length: 280 }),
  // When `anonymous` is true the public donor wall shows only initials.
  anonymous: boolean("anonymous").notNull().default(true),
  legalName: varchar("legal_name", { length: 200 }),
  publicInitials: varchar("public_initials", { length: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- Donations ----------
// Written by the Stripe webhook (and later bKash webhook) on successful events.
// `studentSlug` / `projectSlug` carry the Keystatic slug so we don't need
// foreign keys into the git-backed content.

export const donations = pgTable(
  "donations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    donorUserId: uuid("donor_user_id").references(() => users.id, { onDelete: "set null" }),
    // Stripe Checkout passes anonymous donors through too — we keep the email
    // even when no user account exists.
    donorEmail: varchar("donor_email", { length: 255 }),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    recurring: boolean("recurring").notNull().default(false),
    source: donationSourceEnum("source").notNull(),
    externalReference: varchar("external_reference", { length: 128 }),
    status: donationStatusEnum("status").notNull().default("succeeded"),
    studentSlug: varchar("student_slug", { length: 80 }),
    projectSlug: varchar("project_slug", { length: 80 }),
    dedicationText: varchar("dedication_text", { length: 280 }),
    metadata: jsonb("metadata"),
  },
  (t) => ({
    byDonor: index("donations_donor_idx").on(t.donorUserId),
    byOccurredAt: index("donations_occurred_at_idx").on(t.occurredAt),
    byStudent: index("donations_student_slug_idx").on(t.studentSlug),
    byProject: index("donations_project_slug_idx").on(t.projectSlug),
  }),
);

// ---------- Application submissions ----------

export const scholarshipApplications = pgTable("scholarship_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  applicantName: varchar("applicant_name", { length: 120 }).notNull(),
  guardianName: varchar("guardian_name", { length: 120 }),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  school: varchar("school", { length: 200 }).notNull(),
  grade: varchar("grade", { length: 40 }).notNull(),
  village: varchar("village", { length: 120 }),
  region: varchar("region", { length: 120 }),
  familyIncome: varchar("family_income", { length: 80 }),
  message: text("message").notNull(),
  status: applicationStatusEnum("status").notNull().default("submitted"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewerNotes: text("reviewer_notes"),
});

export const mentorApplications = pgTable("mentor_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  country: varchar("country", { length: 80 }),
  occupation: varchar("occupation", { length: 200 }),
  educationStatus: varchar("education_status", { length: 200 }),
  subjects: varchar("subjects", { length: 400 }).notNull(),
  hoursPerWeek: varchar("hours_per_week", { length: 40 }),
  startTerm: varchar("start_term", { length: 80 }),
  whyMentor: text("why_mentor").notNull(),
  status: applicationStatusEnum("status").notNull().default("submitted"),
  approvedUserId: uuid("approved_user_id").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const studentRegistrations = pgTable("student_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  // When a registration comes from an authenticated student account (the
  // /student-signup flow), link it back so the admin can promote the
  // matching users row + assign a Keystatic slug on approval. Null for
  // anonymous applications submitted via the public form.
  applicantUserId: uuid("applicant_user_id").references(() => users.id, { onDelete: "set null" }),
  studentName: varchar("student_name", { length: 120 }).notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 40 }),
  grade: varchar("grade", { length: 40 }).notNull(),
  school: varchar("school", { length: 200 }).notNull(),
  ethnicity: varchar("ethnicity", { length: 80 }),
  isOrphan: boolean("is_orphan").notNull().default(false),
  guardianName: varchar("guardian_name", { length: 120 }).notNull(),
  guardianRelation: varchar("guardian_relation", { length: 80 }),
  guardianOccupation: varchar("guardian_occupation", { length: 200 }),
  guardianPhone: varchar("guardian_phone", { length: 40 }),
  alternateGuardianPhone: varchar("alternate_guardian_phone", { length: 40 }),
  emergencyContactName: varchar("emergency_contact_name", { length: 120 }),
  emergencyContactRelation: varchar("emergency_contact_relation", { length: 80 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 40 }),
  nationalIdNumber: varchar("national_id_number", { length: 40 }),
  familyIncome: varchar("family_income", { length: 80 }),
  address: text("address").notNull(),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 255 }),
  message: text("message"),
  hobby: varchar("hobby", { length: 200 }),
  lifeTarget: text("life_target"),
  status: applicationStatusEnum("status").notNull().default("submitted"),
  // Review trail — populated when an admin approves or rejects the
  // application. reviewerNotes holds the rejection reason (or any approval
  // commentary). Mirrors the same fields on scholarshipApplications.
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewerNotes: text("reviewer_notes"),
});

// ---------- Mentor records (approved mentors) + assignments + reports ----------

export const mentors = pgTable("mentors", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").references(() => mentorApplications.id, {
    onDelete: "set null",
  }),
  bio: text("bio"),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
});

export const mentorStudentAssignments = pgTable(
  "mentor_student_assignments",
  {
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    studentSlug: varchar("student_slug", { length: 80 }).notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.mentorId, t.studentSlug] }),
    byStudent: index("mentor_assignments_student_idx").on(t.studentSlug),
  }),
);

export const weeklyReports = pgTable(
  "weekly_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    studentSlug: varchar("student_slug", { length: 80 }).notNull(),
    weekOf: timestamp("week_of", { withTimezone: true }).notNull(),
    attendance: varchar("attendance", { length: 40 }),
    studyNotes: text("study_notes"),
    actionItems: text("action_items"),
    attachmentUrl: varchar("attachment_url", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byMentor: index("weekly_reports_mentor_idx").on(t.mentorId),
    byStudent: index("weekly_reports_student_idx").on(t.studentSlug),
    byWeek: index("weekly_reports_week_idx").on(t.weekOf),
  }),
);

// ---------- Rate limiting ----------
// Per-bucket sliding-window rate limit shared across all serverless function
// instances (the in-memory fallback in lib/forms/server.ts only survives a
// single warm Lambda). bucketKey concatenates the form id + client IP so we
// can scope limits per (form, ip) without a composite primary key.

export const rateLimits = pgTable(
  "rate_limits",
  {
    bucketKey: varchar("bucket_key", { length: 200 }).primaryKey(),
    count: integer("count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byExpiresAt: index("rate_limits_expires_at_idx").on(t.expiresAt),
  }),
);

// ---------- Type exports ----------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
export type DonorProfile = typeof donorProfiles.$inferSelect;
export type ScholarshipApplication = typeof scholarshipApplications.$inferSelect;
export type MentorApplication = typeof mentorApplications.$inferSelect;
export type StudentRegistration = typeof studentRegistrations.$inferSelect;
export type Mentor = typeof mentors.$inferSelect;
export type MentorStudentAssignment = typeof mentorStudentAssignments.$inferSelect;
export type WeeklyReport = typeof weeklyReports.$inferSelect;

// Re-export sql for callers who need raw expressions.
export { sql };
