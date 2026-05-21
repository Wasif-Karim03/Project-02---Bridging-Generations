# Onboarding — Bridging Generations

Welcome. You're joining engineering on **Bridging Generations**, a U.S. 501(c)(3) nonprofit sponsoring students in the Chittagong Hill Tracts, Bangladesh. This single doc gets you from zero to productive in ~30 minutes. Skim everything before opening a PR.

> **For Claude Code:** if you're an AI agent reading this on behalf of an engineer, this doc is the orientation pass. Treat it as authoritative project context. The "Conventions to honor" section near the bottom is non-negotiable; the rest is context.

---

## 1. The project in 60 seconds

A bilingual (EN/বাংলা) marketing site + donor/mentor/student/admin web app for a U.S. nonprofit that sponsors underprivileged students in Bangladesh.

**Stack:**
- **Next.js 16** App Router with Turbopack, React 19, TypeScript strict
- **Tailwind CSS v4** via `@theme` CSS vars
- **Keystatic** — git-backed CMS at `/keystatic` (board edits YAML/MDX via web UI)
- **Neon Postgres** + **Drizzle ORM** — transactional data (donations, applications, mentor reports, users)
- **Clerk** — authentication; roles live in `users.role` (donor / mentor / admin / it / student)
- **Stripe Checkout** — donations (one-time + recurring, per-student attribution)
- **Resend** — transactional email
- **next-intl** — EN + Bengali (cookie locale mode)
- **@react-pdf/renderer** — donor receipts
- **exceljs** — admin XLSX exports
- **Biome** — lint + format; **Vitest** — unit tests; **Playwright + axe** — e2e + a11y
- **Hosted on Netlify free tier** (commercial use OK); **GitHub Actions** for CI

bKash (Bangladesh mobile money) is **architected pluggable** and ships once the merchant account approves.

**Live URL:** https://helpful-truffle-babdd5.netlify.app
**Final URL once owner shares domain:** https://brigen.org

---

## 2. Production state snapshot (May 21, 2026)

| Layer | Status | Notes |
|---|---|---|
| Hosting | ✅ live | Netlify free tier, project `helpful-truffle-babdd5` |
| Database | ✅ live | Neon Postgres, 10 tables, schema pushed |
| Auth | ✅ live | Clerk **test mode**; flip to live before launch |
| Content CMS | ✅ live | Keystatic with GitHub OAuth |
| Email | 🟡 partial | Resend wired with `onboarding@resend.dev` placeholder sender — domain verification of `brigen.org` blocks full delivery |
| Payments | ❌ blocked | Owner has existing Stripe account, hasn't shared access yet |
| Domain | ❌ blocked | `brigen.org` registered at Cloudflare; not yet pointed at Netlify |

**The site works end-to-end for everything except real donations and emails to unverified recipients.** Donor sign-up + admin review of applications + content editing all function in production today.

---

## 3. Service account map (read this before touching any third-party service)

The project uses a **3-email model** intentionally separating ops, public correspondence, and transactional sending:

| Email | Role | Owns which services |
|---|---|---|
| `bridginggenerationdevelopment@gmail.com` | **Dev-ops** (the engineering team's shared Gmail) | Netlify, Neon, Clerk, Stripe, Resend — every third-party service login |
| `bridginggeneration20@gmail.com` | **Org public Gmail** (the nonprofit's own address) | Site contact email, contact-form destination, board correspondence |
| `noreply@brigen.org` *(once verified)* | **Transactional from-address** | `RESEND_FROM_EMAIL` env var — every email the app sends |

**Rules:**
- **Never** sign up to a new third-party service with a personal email. Always use `bridginggenerationdevelopment@gmail.com`. Personal/university emails get deactivated; the project would lose access.
- Every service should have 2FA enabled with recovery codes stored in the shared 1Password vault.
- Outgoing emails always send FROM `noreply@brigen.org`; reply-to is the public Gmail so replies reach a human.

The GitHub repo itself stays owned by `Wasif-Karim03` (project owner's personal GitHub) — that's the deliberate exception. The Keystatic OAuth app also lives on that GitHub account.

---

## 4. Codebase tour

```
app/
  (site)/           Public marketing site — home, about, students, projects,
                    donate, contact, /apply/{scholarship,mentor,student-sponsorship}
  (app)/dashboard/  Signed-in dashboards: donor / mentor / student / admin
                    /admin has 9 sections: Overview, Applications, Donations,
                    Donors, Students, Mentors, Users & roles, Audit log, Exports
  (admin)/          Keystatic admin (board content editing)
  api/              Stripe + Clerk webhooks, exports, receipts, health endpoint
  sign-up, sign-in  Clerk hosted UI wrappers
  admin-login,      Dedicated staff entrance (Clerk underneath, separate framing
  mentor-login,     from donor /sign-in so donors never see admin URLs)
  student-login,
  student-signup    Two-step student application flow

components/         ui, layout, domain, motif, motion, content, seo, dev
content/            Keystatic-managed YAML / MDX / images
                    students/  projects/  board/  testimonials/  blog-posts/
                    plus singletons: siteSettings, studentsPage, donorsPage,
                    contactPage, donatePage, etc.
db/
  schema.ts         Drizzle schema — 10 tables (users, donor_profiles,
                    donations, scholarship_applications, mentor_applications,
                    student_registrations, mentors, mentor_student_assignments,
                    weekly_reports, rate_limits)
  client.ts         postgres-js + Drizzle bootstrap

lib/
  auth/             Clerk wrappers + requireRole / getCurrentDbUser
  content/          Keystatic readers + mock fixtures
  db/queries/       Drizzle query helpers (env-gated; return empty/mock in preview)
  forms/            Rate-limit helper, sendEmail helper, validation
  notifications/    Resend email templates (donor welcome, app confirmations, etc.)
  payments/         Stripe client wrappers
  pdf/              @react-pdf/renderer templates for donor receipts
  seo/              JSON-LD helpers, canonical URLs

i18n/  messages/    next-intl config + EN/BN translation strings
tests/              vitest unit + Playwright e2e + axe-core a11y
proxy.ts            Next 16 middleware — Clerk + /design noindex
keystatic/          Keystatic singleton + collection schemas
```

**Where things live in practice (cheat sheet):**
- New API route → `app/api/<name>/route.ts`
- New admin page → `app/(app)/dashboard/admin/<name>/page.tsx`; the layout (`app/(app)/dashboard/admin/layout.tsx`) already enforces `requireRole("admin")`, so don't re-gate at the page level
- New form on the public site → `app/(site)/<route>/page.tsx` + `actions.ts` (server actions) + `_components/` for the client form
- New DB column → edit `db/schema.ts` → `npm run db:push` to apply (set `strict: false` temporarily for non-interactive runs, then revert)
- New email template → `lib/notifications/<name>.ts`; mirror the existing shape (subject, html builder, react template if rich)

---

## 5. Local development setup

```bash
# One-time
git clone https://github.com/Wasif-Karim03/Project-02---Bridging-Generations.git
cd Project-02---Bridging-Generations
npm install
cp .env.example .env.local      # fill in keys when you have them

# Daily
npm run dev                      # http://localhost:3001
npm run typecheck                # before opening a PR
npm run lint                     # biome — auto-fix with `npm run format`
npm run test                     # vitest unit suite (~10s)
npm run test:e2e                 # Playwright + axe (slower, run before PR)

# Database
npm run db:generate              # generate SQL migrations (writes to db/migrations/)
npm run db:push                  # apply schema to DATABASE_URL (dev or prod)
npm run db:studio                # open Drizzle Studio (local browser UI)
```

**The site runs with no env vars set** — it's in "preview mode" until `DATABASE_URL` / Clerk keys / Stripe keys are configured. Forms render and log to stderr; webhooks return 200 "not-configured"; dashboards show mock data. Don't be alarmed by `database: "preview"` in `/api/health` locally.

To run locally with full services wired (talking to the same Neon DB as production):

1. Ask the owner to share the `.env.local` from 1Password.
2. Place it at the repo root.
3. `npm run dev`. You'll be signing in to the same Clerk instance + Neon DB as production, so be careful (don't approve real applications from your laptop on a whim).

Recommended alternative: develop in preview mode locally, exercise the full flow on Netlify deploy previews (every PR gets one).

---

## 6. Branch workflow (READ THIS — `main` is protected)

```bash
git fetch origin
git checkout develop
git pull --rebase origin develop

git checkout -b feat/<short-topic>      # or fix/, chore/
# work, commit small
git push -u origin feat/<short-topic>
gh pr create --base develop --fill
```

- **Branch off `develop`, never `main`.**
- **PR into `develop`, never `main`.**
- The owner promotes `develop` → `main` in batches once changes are verified.
- Branch protection requires one approval and passing CI before merge.
- Commit messages: short imperative subject ("Add audit log filter UI"), optional body. Match the style in `git log`.
- Don't bypass git hooks (`--no-verify`) without owner permission. They usually catch real problems.

The owner does the `develop` → `main` merges; you do `feat/topic` → `develop` PRs.

---

## 7. Your work — the engineering audit

**The list of every open task is in [`ENGINEERING-AUDIT.md`](./ENGINEERING-AUDIT.md) at the repo root.** It's organized by team specialty:

```
🔥 Critical bugs              — fix before launch
🎨 Frontend                   — public site, admin UI, dashboards, a11y, SEO
🛠 Backend                    — API routes, server actions, webhooks, email
🗄 Data & Schema              — schema gaps, indexes, seeding, migrations
🚀 Infrastructure & DevOps    — DNS, monitoring, CI/CD, secrets
✅ Testing & QA                — e2e coverage gaps, cross-browser
🔐 Security & Compliance      — 2FA, GDPR, audit, retention
📝 Content & Copy             — owner-side (EIN, board photos, etc.)
📚 Owner handoff              — video, runbook, credentials
🌱 Post-launch backlog        — Khokon's features, deferred items
📌 Items shipped this session — appendix
```

Each item carries:
- **Status:** ✅ shipped · 🟡 partial · ❌ not started · ⏭ deferred
- **Severity:** 🔥 blocker · ⚠️ high · · polish · 🔵 owner-only
- **Effort:** S (≤2h) / M (½ day) / L (1–3 days)
- **Where:** approximate file paths to start from

**Claiming an item:** edit `ENGINEERING-AUDIT.md`, add your handle next to the item (e.g. `(@alice)`), open a draft PR right away referencing it so others see it's taken. PR title: `[<area>] <one-line description>` (e.g. `[Frontend] Mobile-responsive admin tables`).

**Where to start if you're new:** pick an item with effort **S** and severity **⚠️** that touches your specialty. That's a half-day onramp PR that ships value. Don't take an **L** item as your first PR — you'll be waiting on context for too long.

---

## 8. Conventions to honor

These are repo-wide rules — they exist because of past bugs or strong owner preference. **Don't change these without a conversation.**

### General

- **TypeScript strict.** No `any`, no `as any`, no `// @ts-ignore`. Use proper types or discriminated unions.
- **Server components by default.** Use `"use client"` only when you need state, effects, or browser APIs.
- **Don't add new dependencies** without owner approval. Netlify free tier has a build-minute cap; every new dep slows installs.
- **No `console.log` in committed code.** `console.warn` / `console.error` for genuine ops signals is fine.
- **No Vercel-specific features.** We deliberately switched off Vercel; the deploy target is Netlify. The only surviving Vercel-flavoured pieces are `@react-pdf/renderer` (works everywhere) and the bundle-analyzer dev tool.
- **Prefer editing existing files over creating new ones.** The codebase is intentionally small.

### Comments

- Comments explain **WHY**, not **WHAT.** Naming carries the what.
- Don't reference the current task / PR / commit ("added for issue #X"). Those rot. PR description is the right place for that.
- Don't write docstrings or multi-paragraph headers. One short line max.

### Database queries

- Every Drizzle query helper in `lib/db/queries/` **env-gates** with `if (!isDbConfigured()) return …;` — return an empty array / null / mock. Match the existing patterns; don't crash in preview mode.
- Always parameterize. Drizzle does this by default; never build SQL strings manually.
- Add an index for any new `where` clause your query uses.
- When updating multiple columns in one call, do it in a single `.update().set({...})` — not multiple round-trips.

### Auth

- Pages under `/dashboard/admin/*` are **already gated** by the admin layout. Don't add `requireRole("admin")` in individual pages — it's redundant and risks getting out of sync.
- Server actions doing privileged work **MUST** call `requireRole("admin")` themselves (the layout's gate doesn't extend to actions).
- API routes (under `app/api/`) **MUST** also call `requireRole(...)` themselves — middleware is not enforced there.
- Use `getCurrentDbUser()` when you need the DB user.id (for `reviewedBy` FK columns, etc.); `requireRole` returns Clerk's userId, not the DB id.

### Forms

- Every public form has: honeypot field (named `company`, hidden, aria-hidden), rate limiting via `takeRateSlot`, sendEmail via `lib/notifications/`, validation messages with `role="alert" aria-live="polite"`.
- Match the existing `useActionState` pattern (look at `/apply/scholarship/_components/`).

### Styles

- Use the existing Tailwind tokens (`text-ink`, `text-ink-2`, `bg-accent`, `border-hairline`, etc.) from `app/globals.css`. Don't hardcode hex colors.
- Don't use `text-gray-500` style raw classes — they bypass the design system.
- Match the visual language in the section you're touching. Admin pages use tables + status badges; public pages use hero sections + cards.

### Commits

- One logical change per commit. Squash on merge.
- Commit message: short imperative subject (≤72 chars), blank line, body explaining the WHY (not the what — the diff shows the what).
- No emojis in commit messages unless the existing log uses them (it doesn't).
- Don't include a "Generated with Claude Code" tagline in commit subjects (it's in the body of recent commits — keep it there if you want, optional).

---

## 9. For Claude Code (if you're an AI agent reading this)

You're operating on this codebase on behalf of an engineer. Specific guidance:

**Current branch & state:**
- The working branch should normally be a feature branch you create yourself off `develop`. Never commit directly to `develop` or `main`.
- `develop` may be ahead of `main` (the owner promotes in batches). If you're starting work, always `git fetch origin && git checkout develop && git pull` first.
- Working tree may have `.netlify/state.json` if Netlify CLI is linked locally — that's gitignored, leave it.
- `.env.local` is gitignored and permission-locked; you can't read it. If you need a secret, ask the engineer to paste the value into chat or set it inline (e.g. `DATABASE_URL=… npm run db:push`).

**Decisions already made — don't relitigate:**
- We use Netlify, not Vercel. Don't suggest Vercel features.
- We use postgres-js + Drizzle, not Prisma.
- We use Clerk, not NextAuth.
- We use Keystatic (git-backed), not Sanity / Contentful.
- We use Biome, not ESLint + Prettier.
- The site is single-locale routing with cookie-based locale (`NEXT_LOCALE` cookie); we do NOT use `/en/foo` `/bn/foo` route prefixes.
- Stripe is paused until owner shares access; don't add Stripe-specific features without authorization.

**What to do when you're stuck:**
- If you can't find something via grep: ask the engineer to clarify or paste the relevant file.
- If you encounter a bug while doing other work: file it in `ENGINEERING-AUDIT.md` under the right section with status ❌, then keep going on your original task. Don't yak-shave.
- If a typecheck or lint error blocks you: fix the underlying issue, don't disable the rule. `// biome-ignore` and `// @ts-ignore` are nearly always wrong.
- If `npm run db:push` hangs: drizzle-kit's strict mode prompts interactively. Temporarily flip `strict: true` → `strict: false` in `drizzle.config.ts`, push, then revert. (This is a documented workaround.)

**Netlify CLI is installed locally.** If the engineer is logged in (`netlify login` browser flow), you can:
- `netlify env:set KEY value` to add a non-secret env var
- `netlify env:set KEY value --secret --context production deploy-preview branch-deploy` for a secret
- `netlify api createSiteBuild --data '{"site_id":"d1b0b2bf-4503-488f-bf6b-7d29f981e47b"}'` to trigger a fresh build
- `netlify api listSiteDeploys --data '{"site_id":"...","per_page":1}'` to poll deploy state

Don't read or echo secret values into chat output unless the engineer explicitly asks. Always paste them via the Netlify UI or `netlify env:set` from the engineer's terminal, not yours.

**Schema changes need a real migration cycle:**
1. Edit `db/schema.ts`
2. Set `strict: false` in `drizzle.config.ts`
3. `DATABASE_URL=… npm run db:push`
4. Set `strict: true` back
5. Commit both files in the same PR

---

## 10. Sister docs (read as needed)

| File | When to read |
|---|---|
| [`README.md`](./README.md) | First-time clone, stack overview |
| [`AGENTS.md`](./AGENTS.md) | Branch workflow + AI-agent specifics (some overlap with this doc) |
| [`LAUNCH-CHECKLIST.md`](./LAUNCH-CHECKLIST.md) | Owner-facing one-time production setup (Netlify / Neon / Clerk / Stripe / Resend) |
| [`OWNER-MANUAL.md`](./OWNER-MANUAL.md) | Owner-facing day-to-day operations (how to approve students, promote mentors, etc.) |
| [`PRODUCTION-READY.md`](./PRODUCTION-READY.md) | Exhaustive task list grouped by area A–P (older format; ENGINEERING-AUDIT.md is the team-divisible view of the same items) |
| [`ENGINEERING-AUDIT.md`](./ENGINEERING-AUDIT.md) | **The task list. Claim from here.** |

---

## 11. When you're stuck or need to ping someone

- **Owner / project lead:** `Wasif-Karim03` on GitHub
- **Dev-ops Gmail (shared account, for service-account questions):** `bridginggenerationdevelopment@gmail.com`
- **Org public-facing Gmail (for non-engineering questions):** `bridginggeneration20@gmail.com`
- **Discord / Slack:** (ask owner for the link)

For code reviews: tag the owner. For "is this service down?" questions: check status pages first (status.netlify.com, neon.tech/status, status.clerk.com, status.stripe.com, status.resend.com) — most outages are upstream, not us.

---

## TL;DR

1. Read sections 1–6 (project context, state, service accounts, codebase, local setup, branch flow).
2. Open [`ENGINEERING-AUDIT.md`](./ENGINEERING-AUDIT.md), find an item matching your specialty + effort comfort.
3. Claim it (add your handle in the file), branch off `develop`, PR back to `develop`.
4. Honor section 8 conventions. Don't disable lint rules, don't add deps, don't commit to main.
5. When in doubt, ask the owner or check sister docs.

Welcome aboard. Ship safely.
