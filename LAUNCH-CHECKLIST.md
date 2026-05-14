# Launch Checklist — Bridging Generations

Owner-facing checklist for taking the site from preview to production. Items are ordered so the site picks up new capability as each is completed — you can launch at any point and still have a working site, just with less functionality unlocked.

**Hosting target:** Netlify free tier — commercial use allowed, $0/month forever for this org's scale. The only annual cost is domain renewal (~$12/yr for `brigen.org`).

---

## Phase A — minimum viable launch (~30 minutes)

Just the public marketing site, contact form, application forms (email-only), and Stripe donation flow. **Hosted on Netlify's free tier** (commercial use allowed, ~$0/month forever for this org's scale).

### A1. Connect repo to Netlify
- [ ] Sign in at https://app.netlify.com (free, sign up with GitHub for one-click repo access)
- [ ] **Add new site → Import from Git → GitHub** → pick `Wasif-Karim03/Project-02---Bridging-Generations`
- [ ] Netlify auto-detects Next.js and reads `netlify.toml`. Leave defaults — build command `npm run build`, publish dir `.next`
- [ ] **Deploy site** — the first build will succeed even with zero env vars; the site renders in preview mode

### A2. Configure your custom domain (optional but recommended)
- [ ] Netlify site → **Domain management → Add custom domain** → enter `brigen.org`
- [ ] Add the DNS records Netlify shows you (apex A record + `www` CNAME, or Netlify-managed DNS)
- [ ] Netlify auto-provisions a Let's Encrypt SSL cert
- [ ] Wait for DNS propagation (~5–30 minutes)
- [ ] In Netlify **Site settings → Environment variables**, set `NEXT_PUBLIC_SITE_URL=https://brigen.org`

### A3. Resend for transactional email
- [ ] Sign up at https://resend.com (free tier: 3,000 emails/month)
- [ ] **Domains → Add Domain** → enter `brigen.org`
- [ ] Add the SPF / DKIM / DMARC DNS records Resend shows you
- [ ] Wait for "Verified" status (~1 hour)
- [ ] **API Keys → Create API Key** → copy
- [ ] In Netlify env (Site settings → Environment variables):
  - [ ] `RESEND_API_KEY` = the key
  - [ ] `RESEND_FROM_EMAIL` = e.g. `noreply@brigen.org` (any address on the verified domain)
- [ ] Redeploy. Now contact + application forms send real emails.

### A4. Stripe Checkout
- [ ] Sign in to https://dashboard.stripe.com
- [ ] **Developers → API keys** → copy `pk_test_…` + `sk_test_…` (use test keys to start; flip to LIVE keys at launch)
- [ ] **Developers → Webhooks → Add endpoint**:
  - URL: `https://<your-domain>/api/stripe/webhook`
  - Events: `checkout.session.completed`, `invoice.paid`
  - Copy the **Signing secret** (`whsec_…`)
- [ ] In Netlify env:
  - [ ] `STRIPE_SECRET_KEY` = sk_test_… (then sk_live_… at launch)
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_…
  - [ ] `STRIPE_WEBHOOK_SECRET` = whsec_…
- [ ] **Apply for nonprofit rate**: support.stripe.com → "Special pricing programs" → attach IRS determination letter. Saves ~0.7% per donation. Can be done in parallel; doesn't block launch.
- [ ] Redeploy. Now donations work — but they're not yet persisted (Phase B unlocks that).

### A5. Keystatic GitHub OAuth (for board content edits)
- [ ] Go to https://github.com/settings/developers → **New OAuth App**
- [ ] Application name: `Bridging Generations CMS`
- [ ] Homepage URL: `https://<your-domain>`
- [ ] Authorization callback URL: `https://<your-domain>/api/keystatic/github/oauth/callback`
- [ ] Register, then generate a **client secret**
- [ ] In Netlify env:
  - [ ] `KEYSTATIC_GITHUB_CLIENT_ID` = the Client ID
  - [ ] `KEYSTATIC_GITHUB_CLIENT_SECRET` = the secret
  - [ ] `KEYSTATIC_SECRET` = `openssl rand -base64 32` (32+ random chars)
- [ ] Redeploy. Board members can now sign in at `/keystatic` with their GitHub accounts.
- [ ] Grant each board member **collaborator** access to the GitHub repo so they can authenticate.

✅ **You can launch v1 now.** Public marketing site works, donations work, applications email the board, board edits content via Keystatic.

---

## Phase B — DB-backed persistence (~30 min)

Unlocks: forms persist as queryable rows, admin queue shows real submissions, donor dashboard shows real donation history.

### B1. Provision Neon Postgres
- [ ] Sign up at https://console.neon.tech (free tier: 0.5 GB storage, always free, no credit card)
- [ ] **New Project** → name `bridging-generations`, region nearest your users (e.g. AWS us-east-2)
- [ ] **Connection Details** → copy the connection string (starts with `postgresql://`)
- [ ] In Netlify env (Site settings → Environment variables), set `DATABASE_URL` to that string
- [ ] Locally, copy the same `DATABASE_URL` into `.env.local` (you'll need it to push the schema)

### B2. Push the schema
```bash
npm run db:push
```
This reads `db/schema.ts` and creates the 10 tables + indexes in your Neon database. Run again any time the schema changes.

- [ ] Confirm tables exist via `npm run db:studio` (opens a web UI)

✅ Application form submissions now write to `scholarship_applications`, `mentor_applications`, `student_registrations`. The admin queue at `/dashboard/admin` (once Phase C is done) shows them in real time.

---

## Phase C — Sign-in + dashboards (~20 min)

Unlocks: real donor / mentor / admin dashboards, role-based access.

### C1. Clerk
- [ ] Sign up at https://clerk.com
- [ ] **Create application** → name: `Bridging Generations`
- [ ] Enable sign-in methods you want (Email + password, Google, magic link recommended)
- [ ] **API Keys** → copy `pk_test_…` + `sk_test_…`
- [ ] In Netlify env:
  - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = pk_…
  - [ ] `CLERK_SECRET_KEY` = sk_…

### C2. Clerk webhook
- [ ] Clerk dashboard → **Webhooks → Add endpoint**
- [ ] URL: `https://<your-domain>/api/clerk/webhook`
- [ ] Subscribe to: `user.created`, `user.updated`, `user.deleted`
- [ ] Copy the **Signing secret**
- [ ] In Netlify env: `CLERK_WEBHOOK_SECRET` = the signing secret
- [ ] Redeploy. New Clerk sign-ups now sync to your `users` table automatically.

### C3. Grant yourself admin
- [ ] Sign up at `https://<your-domain>/sign-up`
- [ ] Webhook fires; you appear in the `users` table with role `donor`
- [ ] Locally, run `npm run db:studio` → open `users` table → edit your row → set `role = admin`
  (or, if you have another admin, they can promote you via `/dashboard/admin/users`)
- [ ] Reload the site → you can now access `/dashboard/admin`

✅ Donor / mentor / admin dashboards are fully functional. Promote approved mentor applicants to the `mentor` role via `/dashboard/admin/users`.

---

## Phase D — Polish + production switchover (~30 min)

### D1. Stripe → live keys
- [ ] Stripe dashboard → toggle to **Live mode**
- [ ] Generate new live API keys (`sk_live_…`, `pk_live_…`)
- [ ] Create a new webhook endpoint with the live signing secret
- [ ] Update Netlify env:
  - [ ] `STRIPE_SECRET_KEY` = sk_live_…
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_live_…
  - [ ] `STRIPE_WEBHOOK_SECRET` = the live signing secret
- [ ] Redeploy

### D2. File uploads (donor photos + mentor report attachments)
- [ ] Sign up at https://uploadthing.com or https://cloudinary.com (both free tiers fit this scale)
- [ ] Generate API keys
- [ ] In Netlify env, set the relevant tokens for your chosen provider
- [ ] Update `lib/storage/` to point at the chosen provider (this is the only host-coupled piece — Vercel Blob was the original; we're not married to it)

### D3. Pre-launch content sweep (via Keystatic)
- [ ] Set real **EIN** in `siteSettings`
- [ ] Verify mailing address, contact email, phone
- [ ] Fill in social media URLs (Facebook / Instagram / etc.)
- [ ] Set Form 990 URL when filing is published
- [ ] Set Candid/GuideStar profile URL
- [ ] Upload **real portraits** for all 11 team members (URLs preserved in the scrape doc)
- [ ] Replace any remaining `[CONFIRM:]` markers
- [ ] Toggle HSC/SSC spotlight band on/off in `studentsPage` depending on registration cycle
- [ ] Delete the 4 `[PLACEHOLDER]` projects and 5 placeholder schools left from the demo content (via Keystatic admin)

### D4. Manual QA pass
- [ ] Open `/` — every section renders
- [ ] Click into a student → per-student donate URL works
- [ ] Submit a $5 test donation through Stripe (test mode → confirm webhook fires)
- [ ] Switch to বাংলা → header strings flip; switch back
- [ ] Submit the scholarship application form → check both the email arrived AND the row appears in `scholarship_applications`
- [ ] Sign in as admin → applications queue shows the submission → approve it → status updates
- [ ] Generate a PDF receipt for a donation → renders cleanly
- [ ] Export students.xlsx → opens in Excel/Numbers correctly

### D5. Performance + a11y verification
- [ ] Run Lighthouse on the homepage in Chrome DevTools — target ≥90 on Performance + Accessibility + Best Practices + SEO
- [ ] `npm run test:e2e:a11y` — Playwright axe suite passes
- [ ] Open the site on a real phone (iOS Safari + Android Chrome) — nav drawer, hero carousel, forms all work

✅ Ready for production launch.

---

## Phase E — Future enhancements (after launch)

### E1. bKash
Blocked on bKash merchant account approval (paperwork-heavy). Once you have the credentials:
- [ ] In Vercel env: `BKASH_USERNAME`, `BKASH_PASSWORD`, `BKASH_APP_KEY`, `BKASH_APP_SECRET`, `BKASH_MODE`
- [ ] The pluggable payment interface accepts the new provider — small ~3 day implementation to add the actual API calls

### E2. Stripe nonprofit discount
- [ ] Apply via support.stripe.com (if not done in Phase A4)
- [ ] Once approved, your processing fee drops from 2.9% + $0.30 to 2.2% + $0.30
- [ ] No code change required

### E3. Analytics (deferred)
- [ ] Add Vercel Analytics or Plausible to `app/layout.tsx` if/when you want traffic insights

---

## Operational rhythms (post-launch)

- **Weekly:** Check the admin applications queue. Triage scholarship + mentor submissions.
- **Monthly:** Review the donor dashboard for any failed-payment retries. Generate the monthly donations summary.
- **Each new term:** Toggle HSC/SSC spotlight on `studentsPage` singleton when registration drive starts; toggle off when done.
- **Annually:** Update the Form 990 URL in `siteSettings` after IRS filing.

---

## When something breaks

| Symptom | Where to look |
|---|---|
| Build failing on Netlify | Netlify site → Deploys → click the failed deploy → build log |
| Form submissions not landing in email | Resend dashboard → Logs (look for the matching email) |
| Donations not showing in donor dashboard | Stripe dashboard → Webhooks → check the endpoint is "Active" and recent events succeeded |
| User signed up but doesn't appear in /dashboard/admin/users | Clerk dashboard → Webhooks → check delivery to /api/clerk/webhook |
| Content edits not appearing on the public site | Wait ~1 minute for Netlify to redeploy the new git commit Keystatic just made |
| Bengali content not switching | Verify the BN field is non-empty in Keystatic; empty falls back to EN |

For anything else: check the relevant CI log + Vercel runtime logs first; the error message usually points at the missing env var or misconfigured webhook.
