# Working in this repo

This is the **Bridging Generations** site (a U.S. 501(c)(3) sponsoring students
in the Chittagong Hill Tracts). The owner (`Wasif-Karim03`) is on the main
account; if you've been added as a collaborator, follow the workflow below.

## Branch workflow (READ THIS FIRST)

**`main` is protected.** Direct pushes to `main` are blocked — every change
needs a pull request with at least one approval from the owner.

Your day-to-day flow:

```bash
# Start from develop, never from main directly
git fetch origin
git checkout develop
git pull --rebase origin develop

# Branch off develop for any new work
git checkout -b feat/<short-topic>          # e.g. feat/donor-csv-export
# or fix/<short-topic> for bug fixes, chore/ for tooling

# Make your changes, commit small, push your branch
git add -p                                   # stage hunks, not whole files
git commit -m "Short, imperative subject"
git push -u origin feat/<short-topic>

# Open a PR INTO develop (not main). Owner reviews → merges to develop.
gh pr create --base develop --fill
```

**Never** open a PR straight into `main` unless the owner explicitly asks.
The owner merges `develop` → `main` periodically once a batch of changes is
verified together.

## What an AI agent (Claude / Codex / etc.) should do here

If you're an AI coding assistant working on behalf of a developer in this repo:

- **Never run `git push origin main`** or `git push --force origin main`.
- **Never commit directly to `develop` either** — always create a feature
  branch named `feat/`, `fix/`, or `chore/`.
- When the developer asks "push it," that means push the *feature branch*,
  then offer to open a PR via `gh pr create --base develop --fill`.
- When the developer asks "merge it," confirm whether they mean
  (a) merging their feature branch into `develop` via PR (normal), or
  (b) promoting `develop` to `main` (only the owner does this).
- Don't bypass `git` hooks (`--no-verify`) unless the developer explicitly
  says so. The hooks usually catch real problems.
- Commit messages: short imperative subject, optional body. Match the
  style already in `git log` — concise, no AI signature unless asked.

## Local dev setup

```bash
# One-time
npm install
cp .env.example .env.local         # then fill in keys when you have them

# Daily
npm run dev                         # http://localhost:3001
npm run typecheck                   # before opening a PR
npm run lint                        # biome — autofix with `npm run format`
npm run test                        # vitest unit suite (~10s)
```

The site runs fine with **no env vars set** — it's in "preview mode" until
DATABASE_URL / Clerk keys / Stripe keys are configured. See
`LAUNCH-CHECKLIST.md` for the full owner-side setup.

## Codebase shape (where to find things)

```
app/
  (site)/          public marketing site
  (app)/dashboard/ signed-in dashboards (donor / mentor / student / admin)
  (admin)/         Keystatic CMS at /keystatic
  api/             route handlers (Stripe + Clerk webhooks, exports, health)
  *-login/         Clerk SignIn wrappers per role
  *-signup/        Clerk SignUp wrappers per role
components/        ui, layout, domain, motion, motif, content
content/           Keystatic-managed YAML/MDX (students, schools, board, etc.)
db/                Drizzle schema + client
keystatic/         Keystatic singleton + collection definitions
lib/
  auth/            Clerk wrappers + requireRole guards
  db/queries/      Drizzle query helpers (env-gated)
  forms/           Rate limit + email + validation helpers
  payments/        Stripe client
  pdf/             @react-pdf/renderer templates (donor receipts)
i18n/, messages/   next-intl (EN + Bengali)
tests/             vitest unit + Playwright e2e + axe a11y
proxy.ts           Next 16 middleware (Clerk + /design noindex)
```

## House rules

- **Prefer editing existing files over creating new ones.** The codebase is
  intentionally small.
- **Don't add new dependencies** without flagging the owner — the deploy
  target (Netlify free tier) has a build-minute cap and every new dep slows
  installs.
- **Never write code that depends on a Vercel-specific feature.** We
  deliberately switched off Vercel; the deploy target is Netlify. The only
  surviving Vercel-flavoured pieces are `@react-pdf/renderer` (works
  everywhere) and the bundle-analyzer dev tool.
- **Comments in code should explain WHY, not WHAT.** Naming should carry
  the what.
- **No `console.log` left in committed code.** `console.warn` / `console.error`
  for genuine ops signals is fine.

## When in doubt

Read `README.md` for the stack overview, `LAUNCH-CHECKLIST.md` for production
setup, and recent `git log` for the commit-message style used here. If
anything in this file conflicts with what the developer tells you in
conversation, the developer's instruction wins — but flag the conflict.
