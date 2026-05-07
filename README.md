# Bridging Generations

Marketing site for Bridging Generations, a U.S. 501(c)(3) nonprofit sponsoring students in the Chittagong Hill Tracts, Bangladesh. Editors (the board) manage every public string through Keystatic at `/keystatic`; developers only touch code in this repo.

## Stack

- **Next.js 16** App Router with Turbopack
- **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** via `@theme` CSS variables
- **Keystatic** for content (git-backed, GitHub OAuth in prod)
- **motion** for animation, **Lenis** for smooth scroll, **next-view-transitions** for page transitions
- **Resend** for contact-form delivery, **Givebutter** embed for donations
- **Biome** for lint + format, **Vitest** for unit tests, **Playwright** for e2e + axe

## Local development

```bash
npm install
npm run dev        # http://localhost:3001
```

Non-engineers editing content should read [CONTRIBUTING.md](./CONTRIBUTING.md).

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Next dev server on `:3001` |
| `npm run build` | Production build (Turbopack) |
| `npm run analyze` | Webpack build with `@next/bundle-analyzer` for bundle inspection |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Biome check (verify only) |
| `npm run format` | Biome write (autofix) |
| `npm run test` | Vitest unit tests |
| `npm run test:e2e` | Playwright e2e + axe suite |

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values you need; everything is optional in dev.

| Variable | Scope | What it's for |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | build | Canonical site URL for JSON-LD, sitemap, OG. Defaults to production domain. |
| `RESEND_API_KEY` | server | Contact-form delivery. Without it the route logs to stderr and the form still returns a success state — useful in dev, never leave unset in prod. |
| `RESEND_FROM_EMAIL` | server | Optional override for the `from:` address in contact-form emails. |
| `KEYSTATIC_GITHUB_CLIENT_ID` | preview + prod | Keystatic OAuth app client id. |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | preview + prod | OAuth app secret. |
| `KEYSTATIC_SECRET` | preview + prod | 32+ random chars for session cookie signing (`openssl rand -base64 32`). |
| `KEYSTATIC_URL` | preview + prod | Override if the deploy domain differs from the OAuth callback base. |

When `KEYSTATIC_GITHUB_CLIENT_ID` is unset, Keystatic falls back to local filesystem storage — safe for `next dev`, but the admin UI will not persist writes in production.

## Keystatic admin in production

One-time setup by the site admin:

1. Create a GitHub OAuth App at https://github.com/settings/developers → **New OAuth App**.
   - Homepage URL: `https://<your-domain>`
   - Authorization callback: `https://<your-domain>/api/keystatic/github/oauth/callback`
2. Copy the **Client ID**, generate a **Client Secret**.
3. Set the four `KEYSTATIC_*` variables above in Vercel for Preview and Production.
4. Grant each board editor access to this repo so their GitHub account authenticates.
5. Redeploy.

## Deployment

This site deploys to Vercel. Every PR gets an automatic preview URL. Production is promoted per release — the current launch track has a dedicated Phase 12 for domain setup, OG images, sitemap/robots, CSP enforcement, and Resend domain warmup. Analytics are deferred for v1.

## Pre-launch content checklist

Before the site flips from preview to production, the board fills these via Keystatic — the public routes render defensive fallbacks when any of them is still a `[CONFIRM:]` stub:

- [ ] `siteSettings.ein` — real 9-digit EIN
- [ ] `siteSettings.mailingAddress` — real address or "we operate remotely" note
- [ ] `siteSettings.form990Url` — link to the most recent 990 filing
- [ ] `siteSettings.candidProfileUrl` — GuideStar / Candid profile URL
- [ ] `siteSettings.socialLinks.*` — whichever platforms the org uses
- [ ] Real board portraits + real gallery photos if placeholder assets should be replaced

The detail lives in [CONTRIBUTING.md § Pre-launch content checklist](./CONTRIBUTING.md#pre-launch-content-checklist).

## License

Source code is released under the [MIT License](./LICENSE). Brand, copy, photographs, and identity remain the property of Bridging Generations.
