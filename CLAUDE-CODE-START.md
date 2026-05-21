# Claude Code — Start Here

> Two halves: **top half is for you, the engineer.** **Bottom half is what your Claude Code will read** when you paste the starter prompt. Read the top half once. The bottom half is operating context — you don't need to read it line-by-line, but Claude does.

---

## Part 1 — For the engineer (read once)

### Setup before opening Claude Code

```bash
git clone https://github.com/Wasif-Karim03/Project-02---Bridging-Generations.git
cd Project-02---Bridging-Generations
npm install
# don't bother filling .env.local for now — preview mode is enough for frontend
```

### Open Claude Code (in the repo directory) and paste this as your FIRST message

Copy everything inside the box below and paste it as your very first prompt to Claude. Don't edit it — every line matters.

```
Hi Claude. Before doing anything else on this codebase, please read these
files in order, then summarize what you've understood:

1. CLAUDE-CODE-START.md  (this file's bottom half is written for you)
2. ONBOARDING.md          (project orientation)
3. AGENTS.md              (branch workflow + AI-agent rules)
4. ENGINEERING-AUDIT.md   (open task list)

After reading them, respond with:
1. A 1-paragraph summary of what this project is.
2. The current production state in 1 sentence.
3. 3 conventions you will honor in our work together.
4. 3 things you will NOT do without explicitly asking me first.
5. Confirm you understand the branch flow: branch off `develop`, PR into
   `develop`, never push to `main`.

Then ask me which task from ENGINEERING-AUDIT.md I want to start with.
Don't suggest a task or pick one yourself — wait for me to choose.
```

That's it. Claude will read the four docs, give you a tight summary, and wait for you to pick a task.

### After Claude has read the docs

- Tell Claude which task from `ENGINEERING-AUDIT.md` to work on. **For your first PR, pick an item tagged effort `S` (≤2h) from the Frontend section.** Good candidates:
  - `<link rel="alternate" hreflang="bn">` on Bengali pages
  - Canonical URL verification across the public site
  - Skip-link focus loss on route change
  - `/dashboard/admin/exports` dedicated page extracted from Overview
- Claude will create a feature branch, work through the task, run the lint/typecheck/test gate, and help you open the PR.
- **Don't let Claude touch backend files** (`db/`, `lib/db/queries/`, `app/api/`, `proxy.ts`, `next.config.ts`, `netlify.toml`) unless your task specifically requires it. If Claude proposes such changes for a "frontend" task, push back: "That's outside frontend scope — let's keep this PR focused."

### What to do if Claude doesn't follow the rules

- If Claude tries to skip git hooks (`--no-verify`), refuse.
- If Claude proposes adding a new npm dependency, refuse and ask the project owner first.
- If Claude says "let me just push directly to develop", refuse — always go through a feature branch + PR.
- If Claude proposes changes that look way bigger than your task, ask: "Why is this change needed for the specific item I claimed?"

---

## Part 2 — For Claude Code (your operating manual for this session)

> If the engineer pasted the starter prompt above, you should now be in the "reading required docs" phase. Read this file, then `ONBOARDING.md`, then `AGENTS.md`, then `ENGINEERING-AUDIT.md` — in that order. Then respond per the starter prompt format. Do **not** explore the rest of the codebase yet.

### Your role in this session

You're helping a frontend engineer (the user) ship small, focused PRs into the Bridging Generations codebase. The engineer is new; they've read `ONBOARDING.md` but may miss things. Your job:

- Read the audit + the docs it references
- Help them execute the task they pick — efficiently, without breaking conventions
- Catch when they (or your own suggestions) would violate a convention **before** committing
- When in doubt, ask the engineer rather than guessing

### Hard rules — never violate, even if the engineer asks

1. **Never push to `main`.** Branch protection blocks it; don't even try.
2. **Never commit directly to `develop`.** Always branch first: `feat/<topic>` or `fix/<topic>`.
3. **Never skip git hooks** with `--no-verify`. They catch real bugs.
4. **Never add a new dependency** to `package.json` without the engineer confirming with the project owner first. Netlify free-tier build minutes are limited.
5. **Never echo a secret to chat output.** If the engineer needs a secret in Netlify, they paste it themselves via `netlify env:set` from their terminal.
6. **Never try to read `.env.local`.** It's permission-locked. If you need a secret, ask the engineer to share inline at command time.
7. **Never enable Vercel-specific features.** We use Netlify deliberately. The bundle-analyzer is the only `@vercel/*` package allowed.
8. **Never run destructive git commands** without explicit confirmation: `push --force`, `reset --hard`, `branch -D`, `clean -fd`, `checkout .`.
9. **Never modify `db/schema.ts`, `lib/db/queries/`, `app/api/`, `proxy.ts`, `next.config.ts`, or `netlify.toml`** if the engineer's task is tagged "Frontend" in `ENGINEERING-AUDIT.md`. If the task actually needs one of these, stop and double-check with the engineer first.

### Soft rules — push back if violated, accept if engineer is firm

- Prefer **editing existing files** over creating new ones.
- Comments explain **WHY**, not WHAT. Naming carries the what.
- **No multi-paragraph docstrings.** One short line max.
- Match the existing Tailwind token system (`text-ink`, `text-ink-2`, `bg-accent`, `border-hairline`, etc.). Don't use raw `text-gray-500` style classes.
- **No emojis in code** unless the engineer specifically asks. The codebase doesn't use them.
- Don't write tests beyond what the task requires. The codebase has 346 unit tests already; adding 1–2 for new behavior is fine, adding 30 isn't.

### Common landmines on this codebase

- **`npm run db:push` hangs in interactive prompt mode.** Workaround: edit `drizzle.config.ts` → set `strict: true` → `strict: false`, run push, then revert. Don't leave it on `false`; that's how schema drift creeps in.
- **CSP must allow Clerk on `/sign-up`.** Already fixed in `next.config.ts`. If your task touches the CSP, preserve the `*.clerk.accounts.dev` + `challenges.cloudflare.com` entries.
- **`requireRole("admin")` returns Clerk's userId, NOT the DB user.id.** Use `getCurrentDbUser()` to get the DB id (needed for FK columns like `reviewedBy`).
- **The admin layout already gates all `/dashboard/admin/*` routes** via `requireRole("admin")`. Don't re-gate at the page level — that's redundant and risks drift. But server actions and API routes under those paths MUST still call `requireRole(...)` themselves; the layout doesn't reach into actions.
- **Public forms have a honeypot field named `company`** (hidden, aria-hidden). If you're modifying a form, preserve it.
- **Tables on admin pages use `overflow-x-auto`** — they horizontally scroll on mobile. There's a planned full mobile redesign in the audit (effort L); don't do it as part of an unrelated task.

### Workflow for the engineer's PR

When the engineer picks a task:

1. `git fetch origin && git checkout develop && git pull --rebase origin develop`
2. Create branch: `git checkout -b feat/<task-topic>` (or `fix/<topic>`)
3. Make the changes — small, focused, only what the task requires
4. Run the gate: `npm run typecheck && npm run lint && npm run test`
5. If lint complains: `npm run format` to auto-fix; manual fixes for the rest
6. `git add` only relevant files. Never `git add -A` blindly — check the staged diff first
7. Commit with imperative subject, body explains WHY not WHAT
8. `git push -u origin feat/<task-topic>`
9. `gh pr create --base develop --title "[Frontend] <one-line description>" --body "Closes <task description from ENGINEERING-AUDIT.md>"`
10. Remind the engineer to update `ENGINEERING-AUDIT.md` with their handle next to the claimed item, ideally in the same PR

### When the engineer asks you to do something risky

If they ask for any of:
- Push to `main` directly
- Skip git hooks
- Add a new dependency
- Modify the database schema mid-frontend-PR
- Touch a webhook handler
- Modify `next.config.ts`, `proxy.ts`, or `netlify.toml`

…stop and respond:

> "That action is flagged in CLAUDE-CODE-START.md as a hard-rule. Before I proceed, want to (a) take a different approach that doesn't need this, (b) confirm with the project owner first, or (c) handle this part yourself outside Claude?"

Then wait. Don't proceed without confirmation.

### When you're stuck

- Read more files in the relevant directory; don't speculate.
- If you've read 5+ files and still can't figure out a convention, ask the engineer.
- Don't generate boilerplate from training data — match the patterns in adjacent files.
- If a task requires touching something not covered in this doc or `ONBOARDING.md`, ask the engineer to confirm scope.

### Useful Bash commands for this codebase

```bash
# Quality gate before pushing
npm run typecheck && npm run lint && npm run test

# Auto-fix lint issues
npm run format

# Local dev on http://localhost:3001
npm run dev

# Production build locally (catches build-only errors)
npm run build

# Drizzle Studio (browse DB if DATABASE_URL is set in .env.local)
npm run db:studio

# Push schema after editing db/schema.ts (engineer's task only)
npm run db:push

# Compare your branch to develop
git log origin/develop..HEAD --oneline
git diff origin/develop...HEAD --stat
```

### Netlify CLI access

Already installed globally on most engineers' machines. If the engineer is logged in (`netlify login` browser flow):

```bash
netlify env:set KEY value                                           # non-secret
netlify env:set KEY value --secret --context production deploy-preview branch-deploy   # secret
netlify api createSiteBuild --data '{"site_id":"d1b0b2bf-4503-488f-bf6b-7d29f981e47b"}'  # trigger build
netlify api listSiteDeploys --data '{"site_id":"d1b0b2bf-4503-488f-bf6b-7d29f981e47b","per_page":1}'  # poll latest
```

Don't run these unless the engineer explicitly asks. Most frontend tasks don't need them.

### Codebase quick map (full version in ONBOARDING.md § 4)

```
app/(site)/        Public marketing site
app/(app)/dashboard/   Signed-in dashboards: donor / mentor / student / admin
app/api/           Stripe + Clerk webhooks, exports, receipts, /api/health
components/        ui, layout, domain, motif, motion, content, seo
content/           Keystatic-managed YAML / MDX
db/                Drizzle schema + client
lib/auth/          Clerk wrappers + requireRole + getCurrentDbUser
lib/db/queries/    Drizzle helpers (env-gated; return empty in preview mode)
lib/notifications/ Resend email templates
lib/payments/      Stripe wrappers
i18n/ messages/    next-intl (EN + Bengali)
tests/             vitest unit + Playwright e2e + axe a11y
```

### Done

If you've read this far, you have everything you need. Now read `ONBOARDING.md`, then `AGENTS.md`, then `ENGINEERING-AUDIT.md`. Then respond to the engineer per the starter-prompt format. Don't dump the whole codebase; only read additional files when the specific task requires them.

The engineer is waiting on a 5-bullet summary, not a thesis. Be tight.
