# Deployment Status

_Last updated: 2026-06-09. Credentials/values live in `.private/SECRETS.md` (gitignored) — never in this file (the repo is public)._

## Where it runs

- **Host:** Vercel — project **`bridging-generations-main`** (personal account `wasif-karims-projects`).
- **Production URL:** https://bridging-generations-main.vercel.app
- **Deploys from:** GitHub `Wasif-Karim03/Project-02---Bridging-Generations`, branch `main` (auto-deploy on push).
- **Netlify is retired** as the production host (its config files remain in-repo but are unused).
- ⚠️ A duplicate Vercel project (`bridging-generations.vercel.app`) exists under a separate org Google account and mirrors the same repo. It can't be deleted without that account. Ignore it; treat `-main` as canonical.

## Required environment variables (Vercel → Production)

Values are in `.private/SECRETS.md`. Names only here:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres (transactional data) |
| `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth (donor/mentor/admin) |
| `BOOTSTRAP_ADMIN_EMAIL` | Email that auto-promotes to admin on first signup |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (set to the Vercel URL) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Transactional email |
| `KEYSTATIC_GITHUB_CLIENT_ID` | Keystatic OAuth app id |
| `DEVELOPER_PASSWORD` | Login for the `/developer` content editor |
| `DEVELOPER_GITHUB_TOKEN` | Fine-grained PAT (repo, Contents: Read+write) — lets `/developer` saves commit to GitHub |

**Not yet configured (features dormant):** Stripe (donations), `CLERK_WEBHOOK_SECRET` (not required — first-dashboard-hit backfill seeds the user row), a verified Resend domain.

> **Gotcha:** setting Vercel env vars via `vercel env add` reading from a stdin pipe silently stored EMPTY values in our environment. Set them via the **Vercel dashboard** or the **REST API** (`POST /v10/projects/{id}/env?upsert=true`), then verify with `vercel env pull`.

## Logins

- **Admin:** `/admin-login` → Clerk auth. Admin accounts and the backup password are in `.private/SECRETS.md`.
- **Content editor:** `/developer` → password-gated. Edits commit to `main` via `DEVELOPER_GITHUB_TOKEN` and auto-deploy. Public pages and the editor read the same content, so they stay in sync.

## Data

- Test/demo data was cleared on 2026-06-09 via `npm run reset-test-data` (`scripts/reset-test-data.mjs --confirm`), which deletes all non-admin users (DB + Clerk) and every transactional row while preserving admin accounts.
- Public content (students/projects/etc.) is Keystatic, edited via `/developer`. Operational data (applications/donations/users) is in Postgres, surfaced in `/dashboard/admin`.
