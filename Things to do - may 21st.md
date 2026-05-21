# Things to do — May 21st

Handoff guide for bringing on a new engineer (or contractor) to work on the project. Covers what access to grant, what to share, what to assign, how to review their PRs without micromanaging, and what counts as a red flag.

Pair this with the two existing onboarding docs at the repo root:
- [`ONBOARDING.md`](./ONBOARDING.md) — single-doc orientation for the new engineer (and their Claude Code)
- [`ENGINEERING-AUDIT.md`](./ENGINEERING-AUDIT.md) — full list of open tasks organized by specialty

---

## Quick answer: should you pre-create a branch for them?

**No.** Each engineer creates their own feature branch **per task**.

Khokon's `feat/donors-by-year` branch is **not** a "personal branch" — it's a feature branch he created for that specific feature. When a new engineer takes a task from the audit, they:

```bash
git fetch origin
git checkout develop
git pull --rebase origin develop
git checkout -b feat/<the-task-topic>      # e.g. feat/cookie-consent-banner
# work, commit, push
git push -u origin feat/<the-task-topic>
gh pr create --base develop --fill
```

One branch per task. PR into `develop`. The owner promotes `develop` → `main` in batches. Branch protection on `main` prevents direct pushes; they couldn't accidentally break production even if they tried.

---

## Step 1 — Grant repo access

GitHub repo settings → Collaborators:

```
https://github.com/Wasif-Karim03/Project-02---Bridging-Generations/settings/access
```

- Click **Add people** → enter their GitHub username or email
- Role: **Write** (push branches, but **cannot** push to `main` because of branch protection)
- **Do NOT grant Admin or Maintain** — those roles bypass branch protection rules

That's the only access they need to start. They do **not** need any of:

| What | Why not |
|---|---|
| Netlify access | The owner handles deploys; every PR auto-gets a Netlify preview URL |
| Neon DB credentials | `npm run dev` runs in preview mode — frontend works without a real DB |
| Clerk credentials | Same — Clerk pages render a "PREVIEW MODE" placeholder locally with no auth |
| Stripe / Resend keys | Frontend doesn't touch payment / email flows locally |
| `.env.local` from prod | Don't share secrets; preview mode covers all frontend work |

If they later need to test the full signed-in flow, they can sign up on the Netlify preview URL of their own PR — no secrets need to leave your machine.

---

## Step 2 — Slack / email message template

Copy and send this to them (drop in their name + GitHub handle as needed):

```
Hey, welcome to Bridging Generations engineering 👋

You've been added as a Write collaborator on the repo:
https://github.com/Wasif-Karim03/Project-02---Bridging-Generations

Two files to read in order before doing anything else:

1. ONBOARDING.md (~10 min read) — single doc orienting you to
   the project. Stack, production state, conventions, branch
   workflow, "where to put new stuff" cheat sheet, and a section
   addressed specifically to Claude Code if you use it.
   https://github.com/Wasif-Karim03/Project-02---Bridging-Generations/blob/develop/ONBOARDING.md

2. ENGINEERING-AUDIT.md — the open task list, grouped by
   specialty. For your first PR, claim ONE item from the
   "Frontend" section with effort tag "S" (≤2h). Add your
   GitHub handle next to it in the file when you claim it.
   https://github.com/Wasif-Karim03/Project-02---Bridging-Generations/blob/develop/ENGINEERING-AUDIT.md

Suggested first-PR tasks (small, low-risk, visible win):
  • Add <link rel="alternate" hreflang="bn"> for Bengali pages (SEO, S)
  • Verify canonical URLs across the public site (SEO, S)
  • Fix skip-link focus loss on route change (a11y, S)
  • Dedicated /dashboard/admin/exports page extracted from Overview (S)

If you use Claude Code, point it at ONBOARDING.md first
("read ONBOARDING.md before starting"). It has a whole
section for AI agents covering branch flow, the strict:false
workaround for db:push, decisions already made, etc. so it
won't try to relitigate or break conventions.

Setup:
  git clone https://github.com/Wasif-Karim03/Project-02---Bridging-Generations.git
  cd Project-02---Bridging-Generations
  npm install
  npm run dev        # http://localhost:3001 in preview mode

Branch workflow (the short version):
  • Branch off `develop`, never `main`.
  • Name branches feat/<topic> or fix/<topic>.
  • One branch per task. Don't reuse a branch for the next task.
  • PR into `develop`. I (the owner) merge develop → main in batches.
  • Don't add dependencies without asking first.
  • npm run typecheck && npm run lint before pushing.

Ping me on Slack when you've claimed your item — I'll
prioritize reviewing your first PR fast.

Welcome aboard.
```

---

## Step 3 — Recommended first-PR tasks (ranked)

From [`ENGINEERING-AUDIT.md`](./ENGINEERING-AUDIT.md) § Frontend, ranked by how good they are as an **introduction** PR for a new engineer:

| Task | Effort | Why it's a good first PR |
|---|---|---|
| `<link rel="alternate" hreflang="bn">` on Bengali pages | **S** | Pure metadata addition. Touches `app/layout.tsx` + per-page metadata. Zero risk of breaking anything. |
| Canonical URL verification across public site | **S** | Same — metadata only. Builds confidence working in the codebase. |
| Skip-link focus loss on route change | **S** | Tiny accessibility fix. Visible win when fixed. Touches one component (`components/layout/SkipLink.tsx`). |
| `/dashboard/admin/exports` dedicated page | **S** | Extract from Overview into its own page. Same content, new route. Visible to admin users. Good intro to admin layout patterns. |
| Cookie consent banner | M | Bigger but well-scoped. One new component + `localStorage` flag. **Give as second PR, not first.** |
| Per-route `loading.tsx` skeletons for dashboards | M | Visual polish across dashboards. Multiple files but each small. **Good third PR.** |
| Toast notifications for form actions | M | Touches existing forms. More integration risk; ship one form's toast first, get it reviewed, then propagate. |
| Audit log filter UI (by kind / by reviewer) | M | Mirror the `ApplicationFilters` pattern from `/dashboard/admin/applications`. |
| Mobile-responsive admin tables | **L** | **Don't give to a brand-new engineer.** Touches every admin table, requires understanding the design system. Wait until they've shipped 2–3 smaller PRs and earned trust. |

The progression matters: assign tasks **S → S → M → M → L** in that order. Each merged PR builds confidence (theirs and yours) for the next.

---

## Step 4 — When their PR opens, run this checklist

A 30-second review pass. If any **Tier 1** answer is "no", request changes; don't merge. **Tier 2** is comment-and-suggest, not block.

### Tier 1 — must pass

- ☐ Branch is `feat/*` or `fix/*` (not `main`/`develop` directly)
- ☐ PR targets `develop` (not `main`)
- ☐ CI is green (typecheck + lint + tests)
- ☐ Diff scope matches what they claimed in `ENGINEERING-AUDIT.md`
- ☐ **No new dependencies** in `package.json`
- ☐ **No changes to `db/schema.ts`** (DB schema is backend territory)
- ☐ **No changes to `lib/db/queries/*`** (DB queries are backend territory)
- ☐ **No changes to `next.config.ts`, `proxy.ts`, `netlify.toml`** (infrastructure)
- ☐ **No changes to env vars or `.env.example`**
- ☐ **No new public API routes under `app/api/`**
- ☐ **No changes to webhook handlers** (`app/api/clerk/`, `app/api/stripe/`)
- ☐ **No `console.log`** left in committed code

### Tier 2 — should pass for frontend PRs

- ☐ Uses existing Tailwind tokens (`text-ink`, `bg-accent`, `border-hairline`, etc.) — no hardcoded hex colors, no `text-gray-NNN` raw classes
- ☐ New client components have `"use client"` only where actually needed (state, effects, browser APIs)
- ☐ Accessibility maintained — labels on inputs, `role="alert"` on error states, `aria-current` on active links
- ☐ Mobile behavior tested or noted as untested in the PR description
- ☐ No new emojis in code (codebase doesn't use them)

---

## Step 5 — After their first PR

1. Review with the checklist above.
2. If it's clean: **merge it the same day**, even if small. The fastest way to make a contractor disengage is taking a week to review their first PR.
3. After merge, send: "Nice — shipped. Pick another from the audit when you're ready." Repeats the cycle.
4. After ~3 PRs, you can stop reviewing line-by-line and trust them to self-review on routine frontend work. Keep the checklist for new feature areas.

---

## Red flags — when to start a conversation instead of merging

Any of these means stop, comment, and discuss before merging:

- Their PR touches `db/schema.ts`, `lib/db/queries/`, `app/api/`, `proxy.ts`, `next.config.ts`, or `netlify.toml` despite being a "frontend" task
- They added a dependency (look at `package.json` diff)
- The CI is failing and they ask you to merge anyway
- The PR description doesn't reference an `ENGINEERING-AUDIT.md` item (they're working from a hallucinated requirement, not the actual audit)
- They merged `develop` into their feature branch (we use rebase / clean history — ask them to `git rebase origin/develop` instead)
- They created a new top-level file like `utils.ts`, `helpers.ts`, `App.tsx` — those bypass the project's directory conventions
- They removed or weakened an existing accessibility attribute (`role`, `aria-*`, `<label>`, etc.)

In any of these cases: comment on the PR explaining the concern, request changes, don't merge. They'll usually course-correct.

---

## What about giving them DATABASE_URL or other secrets?

**Default answer: don't.** Preview mode is enough for almost all frontend work — pages render, forms submit (server-side logged), dashboards show mock data. Without secrets:

- They can't accidentally drop a production table
- They can't accidentally email real users
- They can't accidentally charge real cards in Stripe test mode
- They can't accidentally promote themselves to admin in prod

If they specifically need to test against the live DB (rare for frontend), give them a **read-only** Neon connection string scoped to a separate role, not the main `DATABASE_URL`. Document it in their personal `.env.local` only, never commit.

If they need to test the full auth flow, give them the URL of their Netlify preview deploy — that has full prod credentials applied via the CI's env injection. No secrets need to leave your machine.

---

## Summary — the handoff is three files + four steps

**Files:**
- `ONBOARDING.md` (the engineer reads this)
- `ENGINEERING-AUDIT.md` (the engineer claims tasks from this)
- `Things to do - may 21st.md` *(this file — your operational playbook for handing off)*

**Steps:**
1. Add as Write collaborator on GitHub
2. Send the message template above
3. They claim a task → branch → PR → you review with the checklist → merge same day if clean
4. Repeat S → S → M → M → L progression as trust builds

That's the whole loop.
