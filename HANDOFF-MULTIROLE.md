# Multi-role auth rollout — owner handoff

Shipped 2026-05-26. Five PRs landed on `main`. This doc is the morning-after
operating manual.

## What you wake up to

| PR | Title | What it adds |
|---|---|---|
| #38 | Foundation: user status + bootstrap admin + pending-approval page | `user_status` enum, `users.status` + `users.phone`, 5 new roles in enum, `requireActiveUser`, `BOOTSTRAP_ADMIN_EMAIL` env var handling, `/pending-approval` page |
| #39 | /login-roles hub + per-role landing pages | New `/login-roles` hub with 10 role cards + `/login-roles/[role]` per-role landings |
| #40 | Accountant role: schema + signup + dashboard + manual donations + Calculate | `accountant_profiles` + `manual_donation_entries` tables, `/accountant-signup`, `/accountant-login`, `/dashboard/accountant` |
| #41 | Media role: schema + signup + dashboard + folders + items | `media_profiles` + `media_folders` + `media_items` tables, `/media-signup`, `/media-login`, `/dashboard/media` |
| #42 | Donor enhancements + mentor 15-day calls + email templates + admin pending queue | Donor profile extra fields, `mentor_calls` table + workflow, 4 email templates, `/dashboard/admin/pending` |

All five merged through CI and admin-merged into `main`. Netlify auto-deploys.

## ⚠️ Required before any of this is live for real users

The schema additions across these PRs are **not yet applied to the production
Neon DB**. The code on Netlify queries columns that don't exist until you run
the migration. Until you do, dashboards that hit the new tables will 500.

Run **once** from your terminal:

```bash
cd /Users/wasifkarim/Project-02---Bridging-Generations
git pull origin main
DATABASE_URL="$(netlify env:get DATABASE_URL --context production)" npm run db:push
```

If `db:push` hangs on an interactive prompt (per the audit note about strict
mode), edit `drizzle.config.ts` → flip `strict: true` to `strict: false`, run
push, then revert. The migration is **additive only**: no columns are
dropped, no data is lost.

After the migration, optionally set `BOOTSTRAP_ADMIN_EMAIL` in Netlify env
(production context):

```
BOOTSTRAP_ADMIN_EMAIL=wasif.karim.2026@owu.edu
```

The next signup with that email will auto-approve as admin. Every other
signup goes to the pending queue.

## How the new flow works end-to-end

### For visitors picking how to join

- `/login-roles` shows 10 cards: Donor, Student, Mentor, Admin,
  Accountant, Media (live) + Lead, IT Team, Project Management,
  Communication (placeholder).
- Clicking a live card opens `/login-roles/<slug>` with two sub-cards:
  Sign in or Create account. Clicking a placeholder card shows a
  "Coming soon" panel.

### For new signups (all non-bootstrap roles)

1. Sign up via the role-specific Clerk route
2. Land at the role's step-2 details page (mentor / accountant / media)
3. Submit details → DB row inserted, role flipped, status stays `pending`
4. Email sent to applicant ("application received") + org email ("new pending")
5. Dashboards are unreachable; the user lands at `/pending-approval`
6. Admin approves via `/dashboard/admin/pending`
7. User gets approval email + can now sign in normally

### For students (special case)

Students retain the original "see your application status on
`/dashboard/student`" UX even while `status='pending'`. The `requireRole`
status gate exempts them so they can see "Application under review" with
their submitted data. Confirmed against your C.2 clarification.

### For admins

- `/dashboard/admin/pending` — new queue showing all `users.status='pending'`.
  Approve / Reject buttons per row. Reject opens a text box for optional
  reason (passed verbatim into the rejection email).
- `/dashboard/admin/users` — existing page; the role select now includes
  the new roles (accountant / media / lead / pm / comm).

### For donors

- New `DonationMethodPanel` near the top of `/dashboard/donor`
- Three cards: Add card (Stripe **stub** marked "Coming soon"),
  Pay via bKash (**stub**), Call to donate (live phone number + contact link)
- **Existing Stripe webhook + receipt flow is untouched.** The stub is UI
  only.

### For mentors

- `/dashboard/mentor/calls/new` — 15-day call log form using the 5-6
  placeholder questions in `lib/mentor/callQuestions.ts`
- Next-call date auto-suggested 15 days from the call date
- Existing weekly-report flow (separate `weekly_reports` table) untouched

### For donors viewing mentor calls (per-donation visibility)

Built but not yet wired into the donor dashboard UI. The query exists at
`lib/db/queries/mentorCalls.ts:listVisibleCallsForDonor`. It filters by:
*donor sees calls only on dates AFTER their first succeeded donation to
that student*. Add a section to `/dashboard/donor` to surface this when
ready — schema and query are in place.

## Roles in the enum

| Slug | Live? | Login path | Dashboard |
|---|---|---|---|
| donor | ✅ | `/sign-in` | `/dashboard/donor` |
| student | ✅ | `/student-login` | `/dashboard/student` |
| mentor | ✅ | `/mentor-login` | `/dashboard/mentor` |
| admin | ✅ | `/admin-login` | `/dashboard/admin` |
| accountant | ✅ | `/accountant-login` | `/dashboard/accountant` |
| media | ✅ | `/media-login` | `/dashboard/media` |
| it | ➖ placeholder | (none) | (none) |
| lead | ➖ placeholder | (none) | (none) |
| pm | ➖ placeholder | (none) | (none) |
| comm | ➖ placeholder | (none) | (none) |

## What's NOT in this rollout (intentionally deferred)

- **Stripe / bKash real integration** — UI stubs only per spec
- **Real mentor call questions** — 5-6 placeholders in
  `lib/mentor/callQuestions.ts`. Stable ids (q1..q6); swap prompt text
  any time without losing answer history.
- **Lead / IT / PM / Communication dashboards** — no signup, no
  dashboard, no schema beyond enum entry
- **File upload to platform storage** for media role — external URLs only
- **Admin reverification on every login** — separate concern, would need
  OTP infrastructure (lib/notifications, rate_limits, etc.). Tagged as
  follow-up since it didn't block the rollout.

## File map (new + meaningfully changed)

### Schema
- `db/schema.ts` — 7 new tables / columns

### Auth library
- `lib/auth/index.ts` — status gate + new roles
- `lib/auth/roleCatalog.ts` — single source of truth for the hub
- `lib/db/queries/users.ts` — bootstrap admin, setUserStatus, listPendingUsers
- `lib/db/queries/accountantProfile.ts`
- `lib/db/queries/manualDonations.ts`
- `lib/db/queries/mediaFolders.ts`
- `lib/db/queries/mentorCalls.ts`

### Mentor domain
- `lib/mentor/callQuestions.ts`
- `lib/mentor/callCadence.ts`

### Email templates
- `lib/notifications/signupReceived.ts`
- `lib/notifications/signupApproved.ts`
- `lib/notifications/signupRejected.ts`
- `lib/notifications/newPendingSignupAdmin.ts`

### Public-side routes
- `app/login-roles/page.tsx`
- `app/login-roles/[role]/page.tsx`
- `app/pending-approval/page.tsx`

### Auth routes per role
- `app/accountant-signup/[[...sign-up]]/page.tsx`
- `app/accountant-signup/details/page.tsx`
- `app/accountant-signup/details/_components/AccountantSignupForm.tsx`
- `app/accountant-signup/details/actions.ts`
- `app/accountant-login/[[...sign-in]]/page.tsx`
- `app/media-signup/[[...sign-up]]/page.tsx`
- `app/media-signup/details/page.tsx`
- `app/media-signup/details/_components/MediaSignupForm.tsx`
- `app/media-signup/details/actions.ts`
- `app/media-login/[[...sign-in]]/page.tsx`

### Dashboards
- `app/(app)/dashboard/accountant/page.tsx`
- `app/(app)/dashboard/accountant/_components/FinancialSummary.tsx`
- `app/(app)/dashboard/accountant/donations/new/page.tsx`
- `app/(app)/dashboard/accountant/donations/new/_components/NewDonationForm.tsx`
- `app/(app)/dashboard/accountant/donations/new/actions.ts`
- `app/(app)/dashboard/media/page.tsx`
- `app/(app)/dashboard/media/folders/new/page.tsx`
- `app/(app)/dashboard/media/folders/new/_components/NewFolderForm.tsx`
- `app/(app)/dashboard/media/folders/new/actions.ts`
- `app/(app)/dashboard/media/folders/[id]/page.tsx`
- `app/(app)/dashboard/media/folders/[id]/_components/AddItemForm.tsx`
- `app/(app)/dashboard/media/folders/[id]/_components/DeleteItemButton.tsx`
- `app/(app)/dashboard/media/folders/[id]/actions.ts`
- `app/(app)/dashboard/mentor/calls/new/page.tsx`
- `app/(app)/dashboard/mentor/calls/new/_components/LogCallForm.tsx`
- `app/(app)/dashboard/mentor/calls/new/actions.ts`
- `app/(app)/dashboard/admin/pending/page.tsx`
- `app/(app)/dashboard/admin/pending/_components/PendingActions.tsx`
- `app/(app)/dashboard/admin/pending/actions.ts`
- `app/(app)/dashboard/donor/_components/DonationMethodPanel.tsx`

### Modified surfaces
- `app/(app)/dashboard/donor/page.tsx` — status gate + DonationMethodPanel
- `app/(app)/dashboard/mentor/page.tsx` — "Log a call" CTA
- `app/(app)/dashboard/page.tsx` — status routing + role redirect
- `app/(app)/dashboard/admin/donors/[id]/_components/AdminDonorEditor.tsx` — new roles
- `app/(app)/dashboard/admin/donors/[id]/actions.ts` — new roles
- `app/(app)/dashboard/admin/users/_components/UserRoleSelect.tsx` — new roles
- `app/(app)/dashboard/admin/users/actions.ts` — new roles
- `scripts/grant-admin.mjs` — also flips status to 'active'
- `OWNER-MANUAL.md` § 9 — three bootstrap paths documented

## Quality gate status

- ✅ `npm run typecheck` clean on every PR
- ✅ `npm run lint` clean (the only remaining lint output is 2 pre-existing
  informational notes in `app/student-signup/details/actions.ts` that
  predate this rollout — they're string concatenation suggestions, not
  errors, and exit 0)
- ✅ `npm run test` — 346/346 on every PR
- ✅ CI green on every PR

## If you want to roll back

Each PR is its own merge commit. To revert e.g. PR #42:

```bash
git revert -m 1 <merge-commit-sha>
```

Find the SHA via `git log --oneline --merges` on `main`. Open as a PR
against main; CI runs; admin-merge as usual.

The migrations are non-destructive (no DROP COLUMN), so reverting code
without reverting the schema is safe.
