# Bridging Generations

Marketing site + donor / mentor / admin application for **Bridging Generations** — a U.S. 501(c)(3) nonprofit sponsoring underprivileged students in the Chittagong Hill Tracts, Bangladesh.

## Stack

- **Next.js 16** App Router with Turbopack
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** via `@theme` CSS variables
- **Keystatic** — git-backed CMS for marketing content (board edits via `/keystatic`)
- **Neon Postgres** + **Drizzle ORM** — transactional data (donations, applications, mentor reports, users)
- **Clerk** — authentication (donor / mentor / admin / IT roles)
- **Stripe Checkout** — donations (one-time + recurring, per-student / per-project attribution)
- **Resend** — transactional email (contact form, application receipts)
- **next-intl** — bilingual EN / বাংলা (cookie-locale mode)
- **@react-pdf/renderer** — donor receipts
- **exceljs** — admin XLSX exports
- **motion**, **Lenis**, **next-view-transitions** — interaction polish
- **Biome** — lint + format
- **Vitest** — unit tests
- **Playwright + axe** — e2e + a11y
- **GitHub Actions** — CI on every PR

bKash (Bangladesh mobile payment) is **architected pluggable** and slots in once the merchant account is approved.

## Local development

```bash
npm install
npm run dev        # http://localhost:3001
```

The site is fully functional in **preview mode** with no env vars set:

- Forms render and log submissions to stderr
- Stripe + Clerk webhooks return 200 "not-configured"
- Dashboards show mock data
- Donate page shows mailto fallback

Everything "lights up" the moment the matching env var is configured — no code changes required.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server on `:3001` |
| `npm run build` | Production build (Turbopack) |
| `npm run analyze` | Webpack build with `@next/bundle-analyzer` |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome check |
| `npm run format` | Biome write (autofix) |
| `npm run test` | Vitest unit tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright e2e + axe |
| `npm run db:generate` | drizzle-kit generate (write SQL migrations) |
| `npm run db:push` | drizzle-kit push (apply schema to DATABASE_URL) |
| `npm run db:studio` | drizzle-kit studio (browse data via web UI) |

## Repo layout

```
app/
  (site)/          # Public site — home, about, students, projects, donate, etc.
  (app)/           # Signed-in dashboards (donor / mentor / admin)
  (admin)/         # Keystatic admin (content editors)
  api/
    stripe/        # Stripe Checkout session + webhook
    clerk/         # Clerk user-sync webhook
    receipt/       # Per-donation PDF receipt
    export/        # Admin XLSX exports
    keystatic/     # Keystatic OAuth gateway
  apply/           # Public application forms (scholarship / mentor / student)
  sign-in, sign-up # Clerk hosted UI (env-gated)
components/        # ui, layout, domain, motif, motion, content, seo, dev
content/           # Keystatic-managed content (YAML / MDX / images)
db/                # Drizzle schema + client
keystatic/         # Keystatic singleton + collection schemas
lib/
  auth/            # Clerk wrappers + role guards
  content/         # Keystatic reader + mock fixtures
  db/queries/      # Drizzle query helpers (env-gated)
  forms/           # Form helpers (rate limit, email, validation)
  payments/        # Stripe client
  pdf/             # @react-pdf/renderer templates
  seo/             # JSON-LD helpers, canonical URLs
i18n/              # next-intl config + locale actions
messages/          # en.json + bn.json translation strings
tests/             # Vitest unit tests + Playwright e2e
public/            # Static assets
_research/         # (gitignored) scrape docs, session notes
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. **Every var is optional in dev** — the site degrades gracefully.

| Variable | Required for | What it unlocks |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Always (default supplied) | Canonical URL for JSON-LD, sitemap, OG |
| `KEYSTATIC_GITHUB_CLIENT_ID` + `_SECRET` | Production | Board edits content via /keystatic |
| `KEYSTATIC_SECRET` | Production | Session cookie signing |
| `DATABASE_URL` | Phase 4+ | Application forms persist, dashboards show real data |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | Phase 4+ | Sign-in / dashboards |
| `CLERK_WEBHOOK_SECRET` | Phase 4+ | Sync Clerk users → local DB |
| `STRIPE_SECRET_KEY` + `_PUBLISHABLE_KEY` | Phase 5+ | Real donation processing |
| `STRIPE_WEBHOOK_SECRET` | Phase 5+ | Donation row persistence |
| `RESEND_API_KEY` | Production | Real outbound emails |
| `RESEND_FROM_EMAIL` | Production | From-address for emails |
| `BLOB_READ_WRITE_TOKEN` | Phase 6+ | Donor photos, mentor report attachments |

For the full owner-side guide:
- **[LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md)** — one-time production setup (Netlify, Neon, Clerk, Stripe, Resend; DNS records; first admin promotion).
- **[OWNER-MANUAL.md](./OWNER-MANUAL.md)** — day-to-day operations: approving students, promoting mentors, viewing donations, editing content, troubleshooting.
- **[PRODUCTION-READY.md](./PRODUCTION-READY.md)** — exhaustive checklist of what's done vs what's left before launch.

## Content editing (board members)

Editors do not need to write code. Everything that changes on the public site — student records, projects, activities, testimonials, the home-page numbers, the mailing address — lives in the Keystatic admin at `/keystatic`. See [CONTRIBUTING.md](./CONTRIBUTING.md) for the editorial workflow.

## Auth + roles

| Role | Access |
|---|---|
| `anonymous` | Public site only |
| `donor` | Public site + `/dashboard/donor` (donation history, receipts, profile) |
| `mentor` | Donor access + `/dashboard/mentor` (assigned students, weekly reports) |
| `admin` | Mentor access + `/dashboard/admin` (applications queue, user roles, exports) |
| `it` | Admin access (technical role, currently identical) |

The Clerk webhook seeds new users with `donor`; admins promote via `/dashboard/admin/users`.

## Bilingual

EN is the default; users toggle to BN via the language switch in the nav. Bengali content is opt-in per Keystatic entry — fields like `titleBn`, `excerptBn`, `bodyBn` fall back to English when empty.

## Deployment

Deploys to **Netlify free tier** (`netlify.toml` is the source of truth for build config). Every PR gets a preview URL; merging to `main` triggers a production deploy. CI on GitHub Actions runs typecheck + lint + tests on every push. See [LAUNCH-CHECKLIST.md](./LAUNCH-CHECKLIST.md) for the full setup walkthrough.

## License

Source code under the [MIT License](./LICENSE). Brand, copy, photographs, and identity remain the property of Bridging Generations.
