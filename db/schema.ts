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
  // Phase: multi-role auth expansion. Functional roles ship in their own
  // PRs (3 = accountant, 4 = media). The placeholders below land in the
  // enum now so /login-roles can render their "Coming soon" cards without
  // an enum migration mid-rollout.
  "accountant",
  "media",
  "lead",
  "pm",
  "comm",
]);

// User status — gating who can access the dashboards beyond just having a
// Clerk session. Every new signup lands as `pending` and the admin queue
// flips them to `active`. The schema default is `active` so existing rows
// stay accessible after this column is added (backfill-by-default);
// upsertUserFromClerk explicitly writes `pending` for new accounts so the
// gate only applies forward.
export const userStatusEnum = pgEnum("user_status", ["pending", "active", "rejected", "suspended"]);

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
    status: userStatusEnum("status").notNull().default("active"),
    email: varchar("email", { length: 255 }).notNull(),
    displayName: varchar("display_name", { length: 120 }),
    // Self-reported phone, collected at signup for non-donor roles
    // (mentor / accountant / media). Optional for legacy donor accounts.
    phone: varchar("phone", { length: 40 }),
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
  // Phase: multi-role auth expansion (PR 5). Extra fields collected at
  // donor signup — all optional so existing rows aren't disturbed.
  address: text("address"),
  preferredContactMethod: varchar("preferred_contact_method", { length: 40 }),
  dateOfBirth: varchar("date_of_birth", { length: 40 }),
  occupation: varchar("occupation", { length: 200 }),
  organization: varchar("organization", { length: 200 }),
  howHeard: varchar("how_heard", { length: 200 }),
  newsletterOptIn: boolean("newsletter_opt_in").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Mentor 15-day calls. Separate from weekly_reports (which stays for the
// existing weekly-cadence reporting); this table represents the structured
// "every 15 days" call the spec describes. answers is a JSONB blob so the
// question set can change without a migration — mentor_calls.answers.q1,
// .q2, … keyed by question id from lib/mentor/callQuestions.ts.
export const mentorCalls = pgTable(
  "mentor_calls",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mentorId: uuid("mentor_id")
      .notNull()
      .references(() => mentors.id, { onDelete: "cascade" }),
    studentSlug: varchar("student_slug", { length: 80 }).notNull(),
    calledAt: timestamp("called_at", { withTimezone: true }).notNull(),
    // Display-only guideline. last_call_date + 15 days, recomputed at insert.
    // Not enforced — used by the mentor dashboard to show "next call due".
    nextCallDueAt: timestamp("next_call_due_at", { withTimezone: true }),
    answers: jsonb("answers"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byMentor: index("mentor_calls_mentor_idx").on(t.mentorId),
    byStudent: index("mentor_calls_student_idx").on(t.studentSlug),
    byCalledAt: index("mentor_calls_called_at_idx").on(t.calledAt),
  }),
);

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
  applicantUserId: uuid("applicant_user_id").references(() => users.id, { onDelete: "set null" }),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  country: varchar("country", { length: 80 }),
  occupation: varchar("occupation", { length: 200 }),
  educationStatus: varchar("education_status", { length: 200 }),
  classOrYear: varchar("class_or_year", { length: 120 }),
  photoUrl: text("photo_url"),
  subjects: varchar("subjects", { length: 400 }).notNull(),
  hoursPerWeek: varchar("hours_per_week", { length: 40 }),
  startTerm: varchar("start_term", { length: 80 }),
  whyMentor: text("why_mentor").notNull(),
  status: applicationStatusEnum("status").notNull().default("submitted"),
  approvedUserId: uuid("approved_user_id").references(() => users.id, { onDelete: "set null" }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  // Review trail — populated by the admin detail page on any status change.
  // approvedUserId / approvedAt above stay as the "moment of becoming a
  // mentor" markers; these capture every review touch (including rejections
  // and re-reviews) so admins can leave context for each other.
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewerNotes: text("reviewer_notes"),
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

// ---------- Workspace profiles (role-specific extensions) ----------
// Accountant profile extends users with the same shape as mentor signup:
// address + profile picture + start/end dates + free-text "why this role".
// One row per accountant; created at signup. Promoted to active by an
// admin from the pending-signups queue.

export const accountantProfiles = pgTable("accountant_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  photoUrl: varchar("photo_url", { length: 512 }),
  startDate: varchar("start_date", { length: 40 }),
  expectedEndDate: varchar("expected_end_date", { length: 40 }),
  whyAccountant: text("why_accountant"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Manual donation ledger — accountants log gifts received outside the
// Stripe webhook (bank transfer, cash, in-kind). Mirrors the shape of
// `donations` so admins can reconcile the two streams in one view, but
// kept separate so accountant edits never touch Stripe-attributed rows.
// Media profile — same shape as accountant_profiles (start/end dates,
// why-this-role, photo). Distinct table so the two roles can diverge
// later without a forced refactor.
export const mediaProfiles = pgTable("media_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  address: text("address"),
  photoUrl: varchar("photo_url", { length: 512 }),
  startDate: varchar("start_date", { length: 40 }),
  expectedEndDate: varchar("expected_end_date", { length: 40 }),
  whyMedia: text("why_media"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Media folder — one per event or project. Owned by the media-role user
// who created it. Admins see folders across all media users.
export const mediaFolders = pgTable(
  "media_folders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    eventName: varchar("event_name", { length: 200 }),
    eventDate: varchar("event_date", { length: 40 }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byOwner: index("media_folders_owner_idx").on(t.ownerUserId),
    byEventDate: index("media_folders_event_date_idx").on(t.eventDate),
  }),
);

// Media item — image / link / external URL inside a folder. We don't host
// files yet (no blob storage); items carry a URL field pointing at Drive,
// Cloudinary, or any direct image link. Type field distinguishes image vs
// link vs other so the dashboard can render appropriately.
export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    folderId: uuid("folder_id")
      .notNull()
      .references(() => mediaFolders.id, { onDelete: "cascade" }),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    kind: varchar("kind", { length: 16 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    title: varchar("title", { length: 200 }),
    caption: text("caption"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byFolder: index("media_items_folder_idx").on(t.folderId),
  }),
);

export const manualDonationEntries = pgTable(
  "manual_donation_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
    recordedBy: uuid("recorded_by")
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    donorEmail: varchar("donor_email", { length: 255 }),
    donorName: varchar("donor_name", { length: 200 }),
    donorUserId: uuid("donor_user_id").references(() => users.id, { onDelete: "set null" }),
    amountCents: integer("amount_cents").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("usd"),
    method: varchar("method", { length: 80 }).notNull(),
    studentSlug: varchar("student_slug", { length: 80 }),
    projectSlug: varchar("project_slug", { length: 80 }),
    notes: text("notes"),
  },
  (t) => ({
    byOccurredAt: index("manual_donations_occurred_at_idx").on(t.occurredAt),
    byDonorUser: index("manual_donations_donor_user_idx").on(t.donorUserId),
    byStudent: index("manual_donations_student_idx").on(t.studentSlug),
  }),
);

// admin_otp_codes — table previously held the per-session email-OTP
// step-up for admins (see git history). The feature was removed because
// transactional email isn't reliably delivering in this Resend free-tier
// configuration without a verified sending domain. The table is left in
// the database (orphaned, harmless) so we don't need a destructive
// migration; if step-up returns later, restore the schema block + the
// `lib/db/queries/adminOtp.ts` helpers from git.

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
export type AccountantProfile = typeof accountantProfiles.$inferSelect;
export type NewAccountantProfile = typeof accountantProfiles.$inferInsert;
export type ManualDonationEntry = typeof manualDonationEntries.$inferSelect;
export type NewManualDonationEntry = typeof manualDonationEntries.$inferInsert;
export type MediaProfile = typeof mediaProfiles.$inferSelect;
export type NewMediaProfile = typeof mediaProfiles.$inferInsert;
export type MediaFolder = typeof mediaFolders.$inferSelect;
export type NewMediaFolder = typeof mediaFolders.$inferInsert;
export type MediaItem = typeof mediaItems.$inferSelect;
export type NewMediaItem = typeof mediaItems.$inferInsert;
export type MentorCall = typeof mentorCalls.$inferSelect;
export type NewMentorCall = typeof mentorCalls.$inferInsert;

// Re-export sql for callers who need raw expressions.
export { sql };
