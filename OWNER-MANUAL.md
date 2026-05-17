# Owner manual — running Bridging Generations

This guide is for the **board / staff** who run the site day-to-day. It
assumes the production setup is done (see `LAUNCH-CHECKLIST.md` for the
one-time service wiring). Everything below is task-oriented: each section
answers a specific "how do I…" question.

If anything in this manual is wrong or missing, write to the developer or
file an issue on GitHub.

---

## Table of contents

1. [Sign in to the admin panel](#1-sign-in-to-the-admin-panel)
2. [Approve or reject a student application](#2-approve-or-reject-a-student-application)
3. [Promote a donor to mentor](#3-promote-a-donor-to-mentor)
4. [Assign students to a mentor](#4-assign-students-to-a-mentor)
5. [View donations + download a receipt](#5-view-donations--download-a-receipt)
6. [Export student / donor / teacher rosters](#6-export-student--donor--teacher-rosters)
7. [Edit website content (Keystatic CMS)](#7-edit-website-content-keystatic-cms)
8. [Handle a refund](#8-handle-a-refund)
9. [Add or remove an admin](#9-add-or-remove-an-admin)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Sign in to the admin panel

**URL:** `https://brigen.org/admin-login`

You use the email + password you set when your account was created. If you
ever lose the password, click "Forgot password" — Clerk emails a reset link.

After sign-in you land on `/dashboard/admin` — the staff portal. The top
banner shows your name, an `ADM-XXXXXXXX` identifier, and a Sign-out button.

> **First time logging in?** If no admin exists yet, your account starts as
> a donor and you need a one-time database promotion. See
> [Add or remove an admin](#9-add-or-remove-an-admin) below for the exact
> SQL.

---

## 2. Approve or reject a student application

When someone submits a scholarship application at `/student-signup`, you'll
get an email at the contact-form address. To act on it:

1. Go to `/dashboard/admin/students`. Every student who has signed up is
   listed here with a status badge (Pending / Approved / Rejected).
2. For a **Pending** student, you have two choices:

   **Approve** — pick a Keystatic student record from the dropdown in the
   "Decision" column and click **Save**. This:
   - Links their account to the public student profile
   - Sends them an approval email with their Student ID (STU-XXXXXXXX)
   - Unlocks the donor list on their dashboard so they can see sponsors

   **Reject** — click the **Reject** button. A short reason field appears
   (optional but recommended). Click **Confirm rejection**. This:
   - Marks the application as rejected (with your note saved)
   - Sends a soft "wasn't approved this cycle" email with your note
   - Keeps the student's account active — they can still use the site as
     a donor account if they want to

> **Before you can approve, the public student record must exist.** If you
> don't see the student in the dropdown, an admin needs to create them in
> the Keystatic CMS first ([section 7](#7-edit-website-content-keystatic-cms)).
> The student-record fields (portrait, story, grade) are separate from the
> application data because consent rules differ.

---

## 3. Promote a donor to mentor

When someone applies to mentor at `/mentor-signup`, they're created as a
donor by default with a "Mentor application under review" banner on their
dashboard. To promote them:

1. Go to `/dashboard/admin/users`.
2. Find their row.
3. In the role dropdown, change `donor` → `mentor`.

This automatically:
- Updates their role in the database
- Sends them a welcome-to-mentoring email
- Surfaces them on `/dashboard/admin/mentors` for student assignment

If you change your mind, flip back to `donor`. They won't receive another
email on a re-promotion.

---

## 4. Assign students to a mentor

1. Go to `/dashboard/admin/mentors`.
2. Click the mentor's name to open their detail page.
3. Use the "Add a student" dropdown to pick a student → click **Assign**.

The mentor immediately sees the new assignment on their dashboard. To
unassign, click **Remove** next to a student's name.

> Mentors file weekly reports per student. You see recent reports on the
> mentor's detail page (last 10).

---

## 5. View donations + download a receipt

**For a single donor:**
1. Go to `/dashboard/admin` (the overview).
2. Scroll to the **Donors** section. Click the donor's name to drill into
   their detail.
3. The detail page shows: total raised, gift count, sponsored students,
   and the full donation history with external reference IDs (Stripe
   session/invoice IDs) you can cross-check in Stripe.

**For your records (all donations):**
- Click **Export XLSX** in the Donors section to download a spreadsheet.

**For a specific donor's receipt:**
- Receipts are available on the donor's own dashboard (`/dashboard/donor`).
  They can download from there. As admin, you can also pull any receipt
  directly via `/api/receipt/<donation-id>.pdf`.

> **Refunds:** these happen in the Stripe dashboard. The donation row in
> our database keeps its `status = succeeded` until/unless we add a manual
> "mark refunded" tool. For now, log refunds in Stripe and note them on
> the donor's profile via the dedication-text field if needed.

---

## 6. Export student / donor / teacher rosters

Three XLSX exports are linked from `/dashboard/admin` in the "Exports"
section:

- **Students.xlsx** — all currently-enrolled students. Respects the photo-
  release consent: students whose `photoReleaseStatus` ≠ `granted` appear
  by name + grade only (no portrait, no full address).
- **Teachers.xlsx** — all teacher records.
- **Donors.xlsx** — all donor accounts with lifetime giving totals.

These are pulled directly from the live database when you click. The file
opens in Excel, Numbers, or Google Sheets.

---

## 7. Edit website content (Keystatic CMS)

**URL:** `https://brigen.org/keystatic`

This is the content editor for the public site. Board members can edit
everything that appears on the marketing pages — students, projects,
schools, board bios, the homepage stats, the address in the footer — all
without touching code.

The first time you visit you'll be asked to sign in with your GitHub
account. **You need to be a collaborator on the GitHub repo** for this to
work — ask the developer to add you.

### What lives where

| To change… | Edit in Keystatic… |
|---|---|
| The "156 students" stat on the homepage | Stats snapshot |
| Mailing address in the footer | Site settings → Mailing address |
| EIN, phone, contact email | Site settings |
| A student's bio, photo, GPA | Students → pick the student |
| A school's description | Schools → pick the school |
| Project funding goals and progress | Projects → pick the project |
| Board member portraits + roles | Board members → pick the person |
| Terms & Conditions text | Terms page |
| Privacy policy text | Privacy page |
| "About" page mission + vision text | Site settings → Mission full / Vision full |

### How edits get published

Every save in Keystatic creates a Git commit on the production repo.
Netlify watches the repo and re-deploys automatically — your edit goes
live in about 60 seconds. There's no separate "publish" step.

### Photo release before publishing a student portrait

A student's portrait + story only appear publicly when their
`consent.portraitReleaseStatus` is set to **Granted** AND the
`signedDate` is filled in. The form gates the portrait field — if consent
isn't on file, leave the portrait empty and the public profile shows the
name and grade only.

> If a family withdraws consent later, set `revokedAt` on the student
> record. The portrait stops appearing on the next deploy.

---

## 8. Handle a refund

We don't do refunds inside our admin (yet). For now:

1. Go to `https://dashboard.stripe.com`.
2. Find the donation by amount + email + date.
3. Click **Refund**. Stripe handles the rest — donor gets their money back
   in 5-10 business days, and we receive an automated `charge.refunded`
   webhook event.

> The donation row in our database still shows `succeeded` for refunded
> gifts. If this becomes annoying, ask the developer to wire up a manual
> "mark refunded" button on the admin donor-detail page.

---

## 9. Add or remove an admin

### First admin (one-time bootstrap)

Right after launch, there are zero admins. To create the first one:

1. Sign up normally at `https://brigen.org/sign-up`.
2. Open the Neon console: `https://console.neon.tech` → your project →
   **SQL Editor**.
3. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
   ```
4. Sign out, sign back in. Visit `/dashboard/admin` — you're in.

### Every admin after that

1. Have the new admin sign up at `/sign-up` first.
2. As an existing admin, go to `/dashboard/admin/users`.
3. Find their row, change role `donor` → `admin`, click Save.

That's it. They can sign in at `/admin-login` immediately.

### Removing admin access

Same flow, but flip role `admin` → `donor` (or `anonymous` to deactivate
entirely). They keep their account history but lose admin access on next
page load.

---

## 10. Troubleshooting

| Symptom | First place to look |
|---|---|
| Whole site is down | Netlify dashboard → Deploys → check the most recent for errors |
| Donor reports they didn't get a receipt | Stripe → Customers → search by email → check the donation went through. Then Resend → Logs → check if the email tried to send. |
| Donations not showing in donor's dashboard | Stripe → Webhooks → click your endpoint → check recent deliveries. Look for 4xx/5xx responses. |
| Student signed up but doesn't appear in /dashboard/admin/students | Clerk → Webhooks → check the user.created event delivered to /api/clerk/webhook. |
| Edits in Keystatic aren't showing | Wait 1 minute, then refresh. Netlify needs to re-deploy. Check the Deploys tab — there should be a build kicked off by Keystatic's commit. |
| Bengali strings missing | Open `messages/bn.json` and check if the key exists. If empty, the EN fallback renders. |
| /api/health check (uptime monitor) | Visit `https://brigen.org/api/health`. Should return `200` with `{"ok":true, ...}`. If any integration shows `"preview"` instead of `"configured"`, that service's env vars aren't set in Netlify. |

### When to call the developer

- **Anything 500-level** on a real user-facing page (the user sees a
  branded "Something went wrong" page — Netlify logs have the stack trace).
- **Webhook delivery failures** that persist for more than an hour
  (Stripe + Clerk both retry, but if the underlying issue isn't fixed
  events eventually drop).
- **Database errors** in the Netlify function logs (Neon can be temporarily
  unavailable; usually self-heals).
- **DNS / SSL / domain issues** — those involve the registrar.

Useful URLs to bookmark:
- Netlify: https://app.netlify.com
- Neon: https://console.neon.tech
- Stripe: https://dashboard.stripe.com
- Clerk: https://dashboard.clerk.com
- Resend: https://resend.com/emails
- GitHub repo: https://github.com/Wasif-Karim03/Project-02---Bridging-Generations
