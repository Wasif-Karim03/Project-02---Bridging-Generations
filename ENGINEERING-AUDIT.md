# Engineering audit — Bridging Generations (May 2026)

Single source of truth for everything still on the engineering plate, organized **by team specialty** so engineers can claim sections in parallel. Cross-references the broader PRODUCTION-READY.md (which groups items by area A–P); this file is the same items + new ones surfaced after recent admin work, **regrouped for divisible work**.

## How to read this

- **Status:** ✅ shipped · 🟡 partial · ❌ not started · ⏭ deferred (won't ship in v1)
- **Severity:** 🔥 blocker · ⚠️ high · · polish · 🔵 owner-only (not engineering)
- **Effort:** S (≤2h) · M (½ day) · L (1–3 days)
- **Where:** approximate file paths to start from

When you claim an item, add your initials/handle next to it and open a feature branch (`feat/<short-topic>` or `fix/<short-topic>`). Open PR into `develop`; the owner promotes `develop` → `main` in batches.

---

## ⚡ Current production snapshot

| Layer | Status |
|---|---|
| Hosting | ✅ Netlify free tier, project `helpful-truffle-babdd5` |
| Database | ✅ Neon Postgres free tier, 10 tables live |
| Auth | ✅ Clerk test mode wired (donor + admin + mentor signins) |
| Content CMS | ✅ Keystatic w/ GitHub OAuth |
| Email | 🟡 Resend wired with `onboarding@resend.dev` placeholder sender (waiting on `brigen.org` DNS for real domain verification) |
| Payments | ❌ Stripe not yet wired (waiting on owner to share account) |
| Domain | ❌ `brigen.org` registered but not yet pointed at Netlify |
| Live URL | https://helpful-truffle-babdd5.netlify.app |

The site is functional for: public marketing, donor sign-in/sign-up, admin review of applications, content editing via Keystatic, contact-form emails to verified addresses. The site is **not** functional for: actual donations, transactional emails to unverified recipients, branded custom domain.

---

## 🔥 Critical bugs (fix before launch)

These would break production or embarrass the org. **Fix first.**

| Status | Title | Where | Owner |
|---|---|---|---|
| ❌ | Real EIN missing from `siteSettings.ein` — currently placeholder. Donate footer + receipts show wrong/missing value. | `/keystatic` → siteSettings | 🔵 Owner |
| ❌ | Real mailing address, phone, contact email all unverified | `/keystatic` → siteSettings | 🔵 Owner |
| ❌ | 5 board members still have `[CONFIRM:]` markers in their YAML | `content/board/*.yaml` | 🔵 Owner |
| ❌ | Project records: verify no `[PLACEHOLDER]` entries left | `content/projects/*` | 🔵 Owner |
| ❌ | School records: verify no placeholders | `content/schools/*` | 🔵 Owner |
| ❌ | Stripe live keys + live webhook before public launch (currently test keys would also work but are clearly labeled "test" on receipts) | `lib/payments/stripe.ts`, Netlify env | Backend + Owner |
| ❌ | Resend domain verification on `brigen.org` — blocks delivery to anyone but verified addresses | Resend dashboard + Cloudflare DNS | DevOps + Owner |
| ❌ | `NEXT_PUBLIC_SITE_URL` env var still on the Netlify subdomain; must switch to `https://brigen.org` after DNS | Netlify env | DevOps |

---

## 🎨 Frontend

### Public site

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | Cookie consent banner (only if analytics is added; some jurisdictions require disclosure regardless) | new component, layout-level | M |
| ❌ | ⚠️ | `<link rel="alternate" hreflang="bn">` for Bengali pages | `app/layout.tsx`, per-page metadata | S |
| ❌ | · | Canonical URLs verified everywhere | per-page metadata | S |
| ❌ | · | Per-route `loading.tsx` for dashboard sections (skeletons instead of blank flashes) | `app/(app)/dashboard/*/loading.tsx` | M |
| ❌ | · | Toast notifications for success/error actions (currently inline `role="alert"`) | new `<Toast>` component, wire into existing actions | M |
| ❌ | · | Skip-link sometimes loses focus on route change — verify | `components/layout/SkipLink.tsx` | S |
| ✅ | — | Donor flow unified through `/be-a-donor` (deleted orphan `/give` route this session) | — | — |

### Admin UI

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | Application detail page with reviewer notes (shipped this session) | `app/(app)/dashboard/admin/applications/[kind]/[id]/` | — |
| ✅ | — | Filterable applications list page (shipped this session) | `app/(app)/dashboard/admin/applications/` | — |
| ✅ | — | User search on `/users` (shipped this session) | `app/(app)/dashboard/admin/users/_components/UsersTableWithSearch.tsx` | — |
| ✅ | — | Audit log page (shipped this session) | `app/(app)/dashboard/admin/audit/` | — |
| ✅ | — | Donations dashboard (shipped this session) | `app/(app)/dashboard/admin/donations/` | — |
| ✅ | — | Active-tab indicator in admin nav (shipped this session) | `app/(app)/dashboard/admin/_components/AdminNav.tsx` | — |
| ❌ | ⚠️ | Mobile-responsive admin tables (currently `overflow-x-auto` horizontal-scrolls on phones — workable but unpleasant) | every admin `<table>` — apply a "card mode" at `sm:` breakpoint | L |
| ❌ | · | Audit log filter UI (by kind / by reviewer) once review volume grows | `app/(app)/dashboard/admin/audit/page.tsx` + new `_components/AuditFilters.tsx` | M |
| ❌ | · | Dedicated `/dashboard/admin/donors` list page (currently a hash-anchored section on Overview) | new `donors/page.tsx`, extract from Overview | M |
| ❌ | · | Dedicated `/dashboard/admin/exports` page | new `exports/page.tsx`, extract from Overview | S |
| ❌ | · | Bulk operations (approve all, export filtered, batch role-change) | extend applications page + users page | L |
| ❌ | · | Inline application status dropdown should optionally allow notes (currently no-notes path drops reviewer context) | `app/(app)/dashboard/admin/_components/ApplicationStatusControl.tsx` | M |

### Donor / Mentor / Student dashboards

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | Recurring donation cancellation flow (today user must use Stripe portal directly) | Stripe Customer Portal + new `/dashboard/donor/recurring/` page | M |
| ❌ | · | Mentor profile editor (bio, availability, subjects) | `app/(app)/dashboard/mentor/profile/page.tsx` | M |
| ❌ | · | Student profile editor (update phone, life goal post-approval) | `app/(app)/dashboard/student/profile/page.tsx` | M |
| ❌ | · | Email preferences (opt out of non-essential emails) | `app/(app)/dashboard/donor/profile/`, schema column | M |
| ⏭ | — | Bengali toggle on dashboard surfaces (currently public site only) | next-intl wiring across `/dashboard/*` | L |
| 🟡 | ⚠️ | Student ID as a sign-in identifier (display-only today; needs Clerk backend SDK to set username) | Clerk backend SDK + `/api/clerk/webhook` | M |

### Accessibility

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | axe-core tests for new auth + dashboard routes (`/sign-in`, `/dashboard/*`, `/student-signup/details`) | `tests/e2e/` | M |
| ❌ | ⚠️ | Real screen-reader test on iOS VoiceOver + Android TalkBack | manual | M |
| ❌ | · | Keyboard-only walkthrough on every dashboard | manual | M |

### SEO

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | · | Submit sitemap to Google Search Console after launch | manual + GSC console | S |
| ❌ | · | Add `<link rel="alternate" hreflang="bn">` (already listed above under Public site) | — | — |

---

## 🛠 Backend

### API routes & server actions

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | `app/api/export/students.xlsx` has a `TODO (Phase 4+): enforce admin role` — currently relies on auth-less filtering. **Add `requireRole("admin")` gate.** | `app/api/export/students.xlsx/route.ts:14` | S |
| ❌ | ⚠️ | Cross-check `donors.xlsx` + `teachers.xlsx` exports for the same auth gap | `app/api/export/*.xlsx/route.ts` | S |
| ❌ | ⚠️ | Stripe webhook idempotency — verify duplicate `externalReference` is rejected cleanly (unique constraint exists; verify with replay test) | `app/api/stripe/webhook/route.ts` | S |
| ❌ | · | Stripe dispute / chargeback notification handling (`charge.dispute.created` event) | `app/api/stripe/webhook/route.ts` | M |
| ❌ | · | Clerk `user.updated` webhook — verify email change syncs to `users.email` (code path exists; needs real test) | `app/api/clerk/webhook/route.ts` | S |
| ❌ | · | CSRF token verification on server actions (Next 14+ has built-in protection; verify it's not bypassed anywhere) | audit `app/**/actions.ts` | S |
| ❌ | · | First-admin bootstrap script `npm run grant-admin <email>` so owner doesn't have to SQL the first promotion by hand | `scripts/grant-admin.ts` (new) | S |

### Webhooks reliability

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | Replay-safe Stripe webhook test (Stripe CLI `--forward-to` → replay event) | `tests/integration/` (new) | M |
| ❌ | ⚠️ | Clerk webhook signature verification edge cases (svix retry, malformed payloads) | `tests/integration/` (new) | M |
| ❌ | · | Webhook delivery failure alerting (Stripe + Clerk dashboards have built-in but no notification surface) | manual config + Resend alert | S |

### Email pipeline

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | Donor welcome, application confirmation, approval, rejection, donation thank-you, mentor approval (all shipped) | `lib/notifications/*.ts` | — |
| ❌ | · | Password-reset email branding check (Clerk auto-sends; verify it matches site branding) | Clerk dashboard config | S |
| ❌ | ⚠️ | End-to-end email deliverability test on a real inbox after `brigen.org` DNS verification | manual | S |
| ⏭ | — | Newsletter / mass-email tooling (owner uses Resend directly for now) | — | — |

---

## 🗄 Data & Schema

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | mentor_applications schema parity (reviewer_notes + reviewed_by + reviewed_at) — shipped this session | `db/schema.ts` | — |
| ✅ | — | `reviewedBy` always populated on every status change — shipped this session | `lib/db/queries/applications.ts` | — |
| ❌ | · | Audit-log dedicated table (today the audit feed is computed from application tables; if data volume grows or we want to track non-application admin actions like role flips, a dedicated table is cleaner) | `db/schema.ts`, new query helper | M |
| ❌ | · | Soft-delete columns (`deletedAt`) on `users`, `donor_profiles`, `mentors` for GDPR/CCPA "right to be forgotten" requests | `db/schema.ts` migration | M |
| ❌ | · | Daily backup restore drill — verify Neon's auto-backup actually restores | manual | S |
| ❌ | · | Indexes audit — every `where` clause in queries should hit an index. Especially: `donations.donorEmail` (for guest donor lookup), `users.email` (for auto-promote mentor) | `db/schema.ts` indexes | S |
| ❌ | · | Replace any raw `sql\`...\`` template strings with parameterized Drizzle expressions (Drizzle is generally safe but worth a grep) | `lib/db/queries/*` | S |

### Seeding & migrations

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | · | One-shot SQL seed for demo donor profiles (Khokon's branch had 6 YAML; we want the same as Postgres rows for content-shop visibility) | `db/seed/donors.sql` (new) | S |
| ❌ | · | Migration version tracking — currently we run `db:push`; longer-term consider `db:generate` + checked-in migration files for production hygiene | `db/migrations/` | M |

---

## 🚀 Infrastructure & DevOps

### Domain & DNS (🔵 owner-side, devops-supported)

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | 🔥 | `brigen.org` apex A record + `www` CNAME at Cloudflare → Netlify load balancer | Cloudflare DNS panel | S |
| ❌ | 🔥 | Wait for Netlify Let's Encrypt SSL cert | Netlify domain settings | S |
| ❌ | 🔥 | Update `NEXT_PUBLIC_SITE_URL` env var to `https://brigen.org` | Netlify env | S |
| ❌ | 🔥 | Resend `brigen.org` domain verification — add SPF + DKIM + DMARC records at Cloudflare | Cloudflare DNS + Resend dashboard | M |
| ❌ | ⚠️ | DMARC policy ramp: `p=none` → `p=quarantine` → `p=reject` over 2–4 weeks of monitoring | Cloudflare DNS | M (cal time, not work time) |
| ❌ | ⚠️ | MX records if owner wants `@brigen.org` inboxes (separate from Resend's send-only setup) | Cloudflare DNS + email provider | S |

### Monitoring & operations

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | `/api/health` endpoint | `app/api/health/route.ts` | — |
| ❌ | ⚠️ | Error tracking — Sentry (nonprofit free tier) wired into Next.js | new `sentry.*.config.ts` | M |
| ❌ | ⚠️ | Uptime monitor — UptimeRobot / Better Stack pinging `/api/health` every 5 min | external service config | S |
| ❌ | · | Log aggregation (Netlify logs are 24h-only; Logflare / Axiom for retention) | external service config | S |
| ❌ | · | Analytics — Plausible (paid, nonprofit discount) or self-hosted | DOM injection + privacy review | M |

### CI/CD

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | GitHub Actions running typecheck + lint + test on every PR | `.github/workflows/ci.yml` | — |
| ❌ | · | Run e2e tests in CI (currently unit + lint only; e2e runs locally) | `.github/workflows/ci.yml` | M |
| ❌ | · | Preview deploys auto-comment on PR with Netlify preview URL (Netlify usually does this; verify) | Netlify GitHub integration | S |
| ❌ | · | Branch protection on `main` enforces required checks before merge (currently we admin-merge) | GitHub repo settings | S |

### Secrets management

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | Move from "env vars in Netlify UI" to a managed secrets vault (1Password Secrets Automation, Doppler) so rotation is auditable | external + Netlify integration | M |
| ❌ | · | Document a key-rotation runbook (Clerk, Stripe, Resend all support multi-key) | `RUNBOOK.md` (new) | S |

---

## ✅ Testing & QA

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | 346 unit tests passing (vitest + jsdom) | `tests/unit/` | — |
| ✅ | — | Playwright e2e for marketing routes | `tests/e2e/` | — |
| ✅ | — | axe-core a11y on home, donors, gallery, donate, contact, terms | `tests/e2e/*-a11y.spec.ts` | — |
| ❌ | ⚠️ | e2e: full donor signup → donate → receipt download flow | `tests/e2e/donor-flow.spec.ts` (new) | M |
| ❌ | ⚠️ | e2e: student signup → application → admin approval flow | `tests/e2e/student-flow.spec.ts` (new) | M |
| ❌ | ⚠️ | e2e: mentor application → admin approval → mentor sees dashboard | `tests/e2e/mentor-flow.spec.ts` (new) | M |
| ❌ | ⚠️ | e2e: admin role-change flow | `tests/e2e/admin-role.spec.ts` (new) | S |
| ❌ | · | Visual regression / snapshot tests on hero, dashboards, receipts | `tests/visual/` (new), Percy/Chromatic | M |
| ❌ | · | Cross-browser run (currently Chromium only; add WebKit + Firefox) | `playwright.config.ts` | S |
| ❌ | · | Real-device test on iOS Safari + Android Chrome | manual | M |

---

## 🔐 Security & Compliance

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ✅ | — | CSP including Clerk allowlist (shipped this session) | `next.config.ts` | — |
| ✅ | — | Honeypot on all 5 public forms | each form action | — |
| ✅ | — | Webhook signature verification (Stripe + Clerk) | webhook routes | — |
| ✅ | — | Role-based access control on dashboards | `lib/auth/index.ts` | — |
| ❌ | ⚠️ | Enforce 2FA on admin accounts (Clerk supports; needs config flag in dashboard) | Clerk dashboard | S |
| ❌ | · | Account lockout after N failed login attempts (Clerk default — verify config) | Clerk dashboard | S |
| 🟡 | ⚠️ | First-admin bootstrap currently requires manual SQL UPDATE; document or scriptify | LAUNCH-CHECKLIST.md + `scripts/grant-admin.ts` | S |
| ❌ | ⚠️ | "Tax-deductible to the extent allowed by law" disclosure on donate page + receipts (verify text) | `/donate` + `lib/pdf/receipt.ts` | S |
| ❌ | ⚠️ | Donor data retention policy documented | `/privacy` MDX | S |
| ❌ | · | GDPR-aware donor consent flow (only matters if EU donors regularly give) | new component | M |
| ❌ | · | CCPA disclosure (only matters if California donors) | privacy page | S |

---

## 📝 Content & Copy (🔵 owner-side; engineers verify)

| Status | Sev | Title | Where |
|---|---|---|---|
| ❌ | 🔥 | Real EIN in `siteSettings.ein` | Keystatic |
| ❌ | 🔥 | Real mailing address, phone, contact email | Keystatic |
| 🟡 | 🔥 | Board YAML — 5 still have `[CONFIRM:]` | `content/board/*.yaml` |
| 🟡 | ⚠️ | Student records — 10 in Keystatic; verify which are real vs demo | `content/students/` |
| ❌ | ⚠️ | Project records — verify no `[PLACEHOLDER]` projects | `content/projects/` |
| ❌ | ⚠️ | School records — verify no placeholders | `content/schools/` |
| ❌ | ⚠️ | Form 990 URL (post-IRS-filing) | Keystatic `siteSettings` |
| ❌ | ⚠️ | Candid/GuideStar profile URL | Keystatic `siteSettings` |
| ❌ | ⚠️ | Social media URLs | Keystatic `siteSettings` |
| ❌ | ⚠️ | Real portraits for all 11 team members (URLs in scrape doc) | `content/board/*` + image uploads |
| ❌ | ⚠️ | HSC/SSC spotlight band toggle for active registration cycle | Keystatic `studentsPage` singleton |
| ❌ | ⚠️ | Privacy policy text — owner-authored or legal-counsel reviewed | Keystatic `privacyPage` |
| ❌ | · | Cookie disclosure copy if analytics goes live | Keystatic `siteSettings` |

---

## 📚 Owner handoff

| Status | Sev | Title | Where |
|---|---|---|---|
| ✅ | — | README.md, LAUNCH-CHECKLIST.md, AGENTS.md, OWNER-MANUAL.md | repo root |
| ❌ | ⚠️ | Video walkthrough (5–10 min screen recording) of admin panel + Keystatic CMS | external (Loom / YouTube unlisted) |
| ❌ | ⚠️ | RUNBOOK.md — what to do when site is down / email not delivering / donations missing / user-reported bug | new file |
| ❌ | ⚠️ | Credentials handoff — 1Password vault with every service login | external |
| ❌ | ⚠️ | Emergency contacts doc — who to call if X breaks (dev email, Stripe support phone, Resend support, etc.) | RUNBOOK.md |
| 🟡 | · | OWNER-MANUAL.md should mention the new admin pages (Donations, Audit log, filterable Applications) we shipped this session | `OWNER-MANUAL.md` |

---

## 🌱 Post-launch backlog

Features the owner specifically wants but aren't blocking launch. Khokon's `feat/donors-by-year` branch is the design reference.

| Status | Sev | Title | Where | Effort |
|---|---|---|---|---|
| ❌ | ⚠️ | `/donors/year/[year]` public page — year-scoped donor listing | new route + `getDonorsByYear` query | M |
| ❌ | ⚠️ | Per-year donor cards (name, country, photo, total given that year) | `DonorYearCard`, `DonorYearGrid` components | M |
| ❌ | · | Client-side search on the year page | new component | S |
| ❌ | · | `getDonorsByYear(year)` Postgres query helper | `lib/db/queries/donorProfiles.ts` | S |
| ❌ | · | `getYearTotalDonated(donor, year)` helper | `lib/db/queries/donations.ts` | S |
| ❌ | · | `groupHistoryByYearMonth(history)` helper for donor dashboard | `lib/db/queries/donations.ts` | S |
| ⏭ | — | bKash (Bangladesh mobile money) — blocked on merchant account; pluggable architecture in place | `lib/payments/` | M (once merchant approved) |
| ⏭ | — | Donor-side refund request flow | new component + email | M |
| ⏭ | — | Student withdrawal / deactivation flow | new admin action | M |

---

## 🎯 Recommended order of operations

Once the owner shares Stripe access + DNS access:

1. **🔥 Day 1 (DevOps + Owner):** wire `brigen.org` DNS at Cloudflare → Netlify; wait for SSL; update `NEXT_PUBLIC_SITE_URL`; do Resend DNS records.
2. **🔥 Day 1 (Backend):** wire Stripe live keys + create live webhook → Netlify env; lock down the `students.xlsx` export auth gap; smoke-test a $5 donation.
3. **🔥 Day 1 (Owner):** real EIN, address, phone, contact email; replace 5 `[CONFIRM:]` board entries; verify Form 990 URL + Candid URL.
4. **⚠️ Day 2 (Frontend):** mobile-responsive admin tables; per-route loading.tsx skeletons; cookie consent banner; toast notifications.
5. **⚠️ Day 2 (QA):** e2e tests for donor-flow + student-flow + admin-role; axe on dashboards.
6. **⚠️ Day 3 (DevOps):** Sentry + UptimeRobot; CI runs e2e; secrets vault.
7. **⚠️ Day 3 (Backend):** 2FA on admin; recurring-donation cancellation flow; CSRF audit.
8. **Polish + post-launch backlog** — every item with the `·` severity becomes claimable once the launch sequence is green.

---

## 📌 Items shipped THIS session (May 18–21, 2026)

Not yet reflected in PRODUCTION-READY.md; the next person to edit that file should mark them ✅:

- ✅ Netlify migrated to dev Gmail (helpful-truffle-babdd5)
- ✅ Neon migrated to dev Gmail (fresh project, schema pushed)
- ✅ Clerk wired with test keys + webhook
- ✅ Keystatic GitHub OAuth wired
- ✅ Resend wired with `onboarding@resend.dev` placeholder sender
- ✅ CSP allowlist for Clerk (fixed blank /sign-up)
- ✅ Donor flow unified — orphan `/give` route deleted; all donor CTAs go through `/be-a-donor`
- ✅ Per-application admin detail page with reviewer notes
- ✅ Filterable `/dashboard/admin/applications` list page
- ✅ User search on `/dashboard/admin/users`
- ✅ Audit log surface at `/dashboard/admin/audit`
- ✅ Donations dashboard at `/dashboard/admin/donations`
- ✅ Auto-promote on mentor application approve
- ✅ `mentor_applications` schema parity (reviewer_notes / reviewed_by / reviewed_at)
- ✅ `setApplicationStatus` now persists notes + reviewedBy for ALL 3 application kinds (fixed silent data-loss bug for student-sponsorship)
- ✅ Keystatic content card on admin Overview
- ✅ Active-tab indicator in admin nav
- ✅ Documented 3-email service account model (dev / public / transactional) in AGENTS.md
