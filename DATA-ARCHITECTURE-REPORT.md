# Bridging Generations — Data Architecture Report

> Audience: data science / data engineering. Purpose: explain **where data lives**, **what the
> database looks like**, **every table and its columns**, and **how data flows**.
> Verified against source: `db/schema.ts`, `db/client.ts`, `db/migrations/*`, `drizzle.config.ts`,
> `keystatic.config.ts`, `keystatic/*`, `lib/db/queries/*`, `lib/storage/repoImage.ts`.
> Generated 2026-06-18.
>
> Note: the production Postgres lives on **Neon** (remote, `DATABASE_URL` not available locally),
> so the schema below is taken from the code definitions + committed migrations, which are the
> source of truth. Live row counts are not included for that reason.

---

## 1. TL;DR — "MongoDB or what?"

**Not MongoDB.** There are **two separate data stores**, by design:

| Store | Technology | What it holds |
|---|---|---|
| **1. Application database** | **PostgreSQL** (hosted on **Neon**) via **Drizzle ORM** + `postgres-js` | Operational/transactional data: users, donations, applications, mentor reports, admin-curated projects/blog/gallery |
| **2. Content store (CMS)** | **Keystatic** — **git-backed** Markdown/YAML files in `content/`, committed to GitHub | Public website content: student profiles, schools, projects, pages, site settings |

Plus external systems that own their own data:

| System | Role | Data ownership |
|---|---|---|
| **Clerk** | Authentication | Owns auth records; our `users` table mirrors `clerk_user_id` |
| **Stripe** | Card donations | Source of truth for payments; webhook writes a row into `donations` |
| **Resend** | Transactional email | No DB of ours |
| **GitHub repo + jsDelivr CDN** | Image hosting | Uploaded images are committed into the repo and served via CDN (see §6) |

So the data model is **polyglot**: relational SQL for operations, git/Markdown for editorial
content, linked together by **slug strings** (not foreign keys — see §5).

```
                         ┌─────────────────────────────┐
   Clerk (auth) ───────► │  Neon Postgres (Drizzle ORM) │ ◄─── Stripe webhook (donations)
                         │  ~24 tables, operational data│
                         └──────────────┬──────────────┘
                                        │ linked by studentSlug / projectSlug (string, no FK)
                         ┌──────────────┴──────────────┐
   GitHub + jsDelivr ──► │  Keystatic (git-backed MDX)  │  ◄── editors via /keystatic & /developer
   (image CDN)           │  content/  — students, pages │
                         └─────────────────────────────┘
```

---

## 2. The stack that touches data

- **Next.js 16** (App Router), deployed on **Netlify** (`@netlify/plugin-nextjs`) — also Vercel config present.
- **PostgreSQL on Neon** — the relational application database.
- **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) with the **`postgres-js`** driver — schema, queries, migrations.
- **Keystatic** (`@keystatic/core` + `@keystatic/next`) — git-backed CMS for editorial content.
- **Clerk** (`@clerk/nextjs`) — authentication / sessions.
- **Stripe** (`stripe` + `@stripe/stripe-js`) — donation payments (bKash + manual planned).
- **Resend** — transactional email.
- **GitHub Contents API + jsDelivr** — image hosting (no paid blob storage).
- Exports: `@react-pdf/renderer`, `exceljs` — PDF/Excel report generation (read-side).
- `aws4fetch` is a dependency but **not currently wired** — some code comments mention Cloudflare R2; the live image path uses GitHub+jsDelivr (§6).

### Database connection (`db/client.ts`)
- `getDb()` lazily creates one Drizzle client per server instance: `postgres(url, { max: 1, prepare: false })`.
  `max: 1` deliberately avoids exhausting Neon's serverless connection limit on cold starts.
- `isDbConfigured()` guards every caller — the app degrades gracefully when `DATABASE_URL` is unset
  (e.g. local/preview without Neon), falling back to Keystatic-only behaviour.
- `DATABASE_URL` is injected by the **Neon ↔ Vercel/Netlify integration** in production, or set in `.env.local` for dev.

---

## 3. Schema management — for a data engineer

- **Versioned SQL migrations** live in `db/migrations/` (Drizzle Kit). Current migrations:
  - `0000_featured_donors.sql` — the bulk of the schema (users, donations, applications, mentors, etc.)
  - `0001_projects.sql`, `0002_blog_posts.sql`, `0003_gallery.sql`
  - `db/migrations/meta/_journal.json` tracks applied migrations (Drizzle journal v7, postgres).
- **Source of truth for the schema = `db/schema.ts`** (Drizzle table definitions in TypeScript).
- Commands (from `drizzle.config.ts`, dialect `postgresql`, out `./db/migrations`):
  - `pnpm drizzle-kit generate` → write a new migration from schema changes
  - `pnpm drizzle-kit push` → apply pending migrations to `DATABASE_URL`
- **Naming convention:** camelCase fields in TS → `snake_case` columns in SQL
  (e.g. `donorUserId` → `donor_user_id`, `amountCents` → `amount_cents`).
- Primary keys are **UUIDs** (`uuid().defaultRandom()`) on almost every table.
- All money is stored as **integer cents** (`amount_cents`, `raised_cents`, `target_cents`).
- Timestamps are `timestamptz` (`with timezone`).
- One historical note in code: an `admin_otp_codes` table was removed from the schema but left
  **orphaned in the database** (harmless) to avoid a destructive migration.

---

## 4. Postgres tables (the application database)

### Enums (5)
| Enum | Values |
|---|---|
| `user_role` | anonymous, donor, mentor, admin, it, student, accountant, media, lead, pm, comm |
| `user_status` | pending, active, rejected, suspended |
| `application_status` | submitted, under_review, approved, rejected, withdrawn |
| `donation_status` | pending, succeeded, failed, refunded |
| `donation_source` | stripe, bkash, manual |

### Tables (~24) grouped by domain

**Identity & roles**
| Table | Purpose | Key columns |
|---|---|---|
| `users` | Mirror of Clerk accounts; canonical role/status | id (uuid PK), clerk_user_id (unique), role (enum), status (enum), email, display_name, phone, student_slug, timestamps. Indexes: email, student_slug |
| `donor_profiles` | Extended donor info + donor-wall display | user_id → users (cascade), photo_url, dedication_text, anonymous, legal_name, public_initials, address, occupation, organization, newsletter_opt_in, … |
| `accountant_profiles` | Accountant role profile (1 per user) | user_id → users (unique), full_name, phone, address, photo_url, start/expected_end_date, why_accountant |
| `media_profiles` | Media role profile (1 per user) | user_id → users (unique), full_name, phone, address, photo_url, dates, why_media |

**Applications & onboarding** (form submissions, reviewed by admins)
| Table | Purpose | Notable columns |
|---|---|---|
| `scholarship_applications` | Public scholarship applications | applicant_name, guardian_name, email, phone, school, grade, village, region, family_income, message, status (enum), reviewed_by → users, reviewer_notes |
| `mentor_applications` | Mentor applications | name, email, phone, occupation, subjects, why_mentor, **photo_data (base64 PII)**, photo_mime_type, status, approved_user_id → users, review trail |
| `student_registrations` | Full scholarship intake form (mirrors paper form) | student_name, dob, grade, school, guardian details, emergency contacts, **national_id_number**, **photo_data (base64 child PII)**, registration_no, financials (required_amount, per_installment…), status, review trail |

**Mentorship operations**
| Table | Purpose | Key columns |
|---|---|---|
| `mentors` | Approved mentor records | user_id → users (unique, cascade), application_id → mentor_applications, bio, started_at, ended_at |
| `mentor_student_assignments` | Mentor ↔ student links | **composite PK (mentor_id, student_slug)**, assigned_at, ended_at. Student is a *slug*, not an FK |
| `mentor_calls` | Structured 15-day mentor calls | mentor_id → mentors, student_slug, called_at, next_call_due_at, **answers (jsonb)**, notes |
| `weekly_reports` | Weekly mentor reports | mentor_id → mentors, student_slug, week_of, attendance, study_notes, action_items, attachment_url |

**Donations & finance**
| Table | Purpose | Key columns |
|---|---|---|
| `donations` | Stripe/bKash donation ledger (webhook-written) | amount_cents, currency, recurring, source (enum), external_reference, status (enum), donor_user_id → users (set null), donor_email, student_slug, project_slug, dedication_text, **metadata (jsonb)**. Indexes on donor, occurred_at, student, project |
| `manual_donation_entries` | Off-Stripe gifts logged by accountants (cash/bank/in-kind) | recorded_by → users, occurred_at, donor_email/name, amount_cents, method, student_slug, project_slug, notes |
| `featured_donors` | Admin-curated public donor wall | slug (unique), name, photo_url, blurb, display_order, published |
| `donor_contributions` | Per-student gift rows for a featured donor | donor_id → featured_donors (cascade), student_name, student_ref, amount_cents, year, month |

**Admin-curated public content (DB-backed, distinct from Keystatic)**
| Table | Purpose | Key columns |
|---|---|---|
| `projects` | Fundraising project showcase | slug (unique), name, tagline, description, cover_url, raised_cents, target_cents, currency, display_order, published |
| `project_images` | Project gallery photos | project_id → projects (cascade), url, caption, sort_order |
| `project_links` | External links on a project | project_id → projects (cascade), label, url, sort_order |
| `blog_posts` | DB-backed blog (English/Bengali UTF-8) | slug (unique), title, cover_url, body, display_order, published |
| `blog_post_links` | Links under a blog post | post_id → blog_posts (cascade), label, url, sort_order |
| `gallery_images` | Admin gallery uploads | url, caption, tag (Humanity/Activities/Projects/Students/Publication), sort_order |

**Media workspace**
| Table | Purpose | Key columns |
|---|---|---|
| `media_folders` | One folder per event/project | owner_user_id → users (cascade), name, event_name, event_date, description |
| `media_items` | Image/link item inside a folder | folder_id → media_folders (cascade), uploaded_by → users, kind, url, title, caption |

**Infrastructure**
| Table | Purpose | Key columns |
|---|---|---|
| `rate_limits` | Cross-instance sliding-window rate limiting | **bucket_key (varchar PK)** = formId+IP, count, expires_at, updated_at |

> Also present but orphaned: `admin_otp_codes` (feature removed; left in DB to avoid a destructive migration).

---

## 5. Relationships — how the two stores link

**Inside Postgres** there ARE real foreign keys (all the `→ users`, `→ mentors`, `→ projects`,
`→ featured_donors`, `→ media_folders`, `→ blog_posts` references above, with `cascade` or
`set null` on delete).

**Between Postgres and the CMS there are NO foreign keys.** Student and project content lives in
git-backed Keystatic, so the DB references them by **slug string**:
- `users.student_slug`, `donations.student_slug`, `mentor_calls.student_slug`,
  `weekly_reports.student_slug`, `mentor_student_assignments.student_slug` → all point at a
  `content/students/<slug>/` Keystatic record.
- `donations.project_slug` → a `content/projects/<slug>/` (or the `projects` DB table) record.

**Implication for analytics:** joins across the content boundary are **string joins on slug**, not
referential-integrity FKs. A slug can exist in the DB while the content record is renamed/removed
(and vice versa) — validate slug coverage when reporting.

---

## 6. Where images / files live

- **Primary image hosting = GitHub repo + jsDelivr CDN** (`lib/storage/repoImage.ts`).
  Uploaded images (donor/project/etc. photos) are committed into the repo via the GitHub Contents
  API and served from `https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit>/<path>`, pinned to the
  commit so they're live instantly with no deploy lag. The DB stores only the **public URL**
  (`photo_url`, `cover_url`, `url`, …). No paid blob storage; no extra API keys beyond the GitHub
  content token.
- **Sensitive PII photos are stored IN Postgres as base64**, deliberately *not* in the public repo:
  `mentor_applications.photo_data` and `student_registrations.photo_data` (+ `photo_mime_type`).
  These are child/applicant PII, consent-gated, served through an authenticated route
  (`app/api/student-photo/[id]/route.ts`).
- **Keystatic images** (editorial) are committed to the git content repo alongside the Markdown.
- `aws4fetch` / Cloudflare R2 is referenced in a few comments but **not the active path**.

---

## 7. Keystatic content store (git-backed CMS)

Editorial/public content is **Markdown + YAML committed to GitHub** (`content/`), edited via
`/keystatic` (GitHub-backed in prod) or the password-gated `/developer` editor. No database rows —
versioned by git history.

**Collections (11)** — many records each, under `content/<collection>/<slug>/`:
`school`, `student`, `project`, `activity`, `blogPost`, `successStory`, `testimonial`,
`galleryImage`, `boardMember`, `teacher`, `donorProfile`.

**Singletons (~12–13)** — one document each (pages/config):
`siteSettings`, `statsSnapshot`, `donorsPage`, `donatePage`, `donationJourney`, `contactPage`,
`termsPage`, `privacyPage`, `studentsPage`, `projectsPage`, `scholarshipsPage`, `pageMedia`.

**Child-safety design in the `student` collection** (worth flagging for any data work):
first-name-only display names, internal slug (`bg-0042`) never rendered publicly, explicit
`storyReleaseStatus` consent states (pending/granted/denied/revoked) and consent scopes
(website/print/social/grant-reports/press). Bios and quotes are gated on recorded consent —
"never guess" is enforced by the schema's defaults.

---

## 8. How data flows (read & write paths)

**Writes into Postgres** go through Drizzle in two places:
- **Server Actions** (`app/**/actions.ts`): signup/profile flows for mentor, accountant, media,
  and student; mentor calls; student registration. These call `getDb()` and insert/update rows.
- **`lib/db/queries/*`**: typed query modules — `donations`, `applications`, `users`,
  `featuredDonors`, `projects`, `blogPosts`, `gallery`, `manualDonations`, `mentorCalls`,
  `weeklyReports`, `donorProfiles`, `accountantProfile`, `mediaFolders`, `studentGrowth`,
  `auditLog`.
- **Webhooks** (`app/api/stripe/webhook/route.ts`, `app/api/clerk/webhook/route.ts`):
  Stripe success events → `donations` row; Clerk events → upsert `users` (`upsertUserFromClerk`,
  new accounts land as `status = pending`).

**Reads:** dashboards (admin/mentor/accountant/media/donor/student) read via the same query
modules; public pages read Keystatic content (and some DB-backed projects/blog/gallery). Reports
are exported to **PDF** (`@react-pdf/renderer`) and **Excel** (`exceljs`).

**Forms & abuse control:** `lib/forms/server.ts` + the `rate_limits` table provide a
cross-instance sliding-window limit keyed by `formId + IP`.

---

## 9. Notes & gotchas for analytics / data science

- **Two sources of truth.** Operational data = Neon Postgres; public content = git/Keystatic.
  Plan ETL for both; join them on **slug strings**, not FKs.
- **Money is integer cents** (`amount_cents`, `raised_cents`, `target_cents`). Divide by 100;
  respect `currency` (default `usd`).
- **Two donation streams to reconcile:** `donations` (Stripe/bKash/automatic) and
  `manual_donation_entries` (accountant-logged). Kept separate on purpose; union them for totals.
- **Featured-donor totals are computed, not stored** — derive from `donor_contributions`
  (and `projects` progress from `raised/target`); don't expect a stored total column.
- **JSONB columns:** `donations.metadata`, `mentor_calls.answers` (keyed by question id). Parse, don't assume flat.
- **PII lives in the DB:** `student_registrations` and `mentor_applications` hold names, phones,
  national ID, addresses, and base64 passport photos (child PII). Treat these tables as
  consent-gated and restricted — do not export to shared/analytics environments without sign-off.
  Public student profiles are consent-gated separately in Keystatic.
- **UUID PKs everywhere** (not auto-increment ints).
- **No live local DB** — to inspect production, connect to Neon with the `DATABASE_URL`
  (prefer a read-replica/branch). The schema here matches `db/schema.ts` + `db/migrations/`.

---

*Source of truth: `db/schema.ts`, `db/client.ts`, `db/migrations/*`, `drizzle.config.ts`,
`keystatic.config.ts`, `keystatic/collections/*`, `keystatic/singletons/*`, `lib/db/queries/*`,
`lib/storage/repoImage.ts`, `app/api/stripe/webhook`, `app/api/clerk/webhook`.*
