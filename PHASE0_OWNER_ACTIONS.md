# Phase 0 — Owner Action Items

Before we can write the application layer of the site (donor accounts, mentor dashboard, admin panel, payments), the org needs accounts at five services. This doc lists exactly what to sign up for, in what order, and what to send back to the dev team.

Everything below is free or already owned. **Total ongoing cost: ~$21/month.** Stripe fees (paid out of donations, not from the org's pocket) drop from 2.9% to 2.2% if you apply for their nonprofit discount in step 6.

---

## Already in hand

- ✅ **Stripe account** (existing, used on brigen.org)
- ✅ **Domain** (existing — confirm which one will host the new site: `brigen.org` or other)

---

## To create (in this order)

### 1. GitHub account / organization (free)
Used for: code hosting + Keystatic content edits (board members edit content through GitHub via Keystatic admin).

1. Go to https://github.com → sign up (or sign in with an existing account).
2. If desired, create an **organization** called `bridginggenerations` so multiple board members can have edit access without using personal accounts. Free tier is fine.
3. **Send back:** the GitHub username or org name.

---

### 2. Vercel account (free → $20/month Pro for hosting)
Used for: hosting the site + database + previews.

1. Go to https://vercel.com → sign up with GitHub (from step 1).
2. Upgrade to **Pro** ($20/month). Hobby tier is not allowed for commercial fundraising sites per Vercel's ToS.
3. **Send back:** the Vercel team name.

---

### 3. GitHub OAuth App for Keystatic (free)
Used for: letting board members log in to the content admin via their GitHub account.

1. Go to https://github.com/settings/developers → **New OAuth App**.
2. Fill in:
   - **Application name:** `Bridging Generations CMS`
   - **Homepage URL:** `https://<your-vercel-domain>` (we'll use the Vercel preview URL for now; you can update to the real domain later)
   - **Authorization callback URL:** `https://<your-vercel-domain>/api/keystatic/github/oauth/callback`
3. Click **Register application**.
4. Generate a **Client Secret** (click "Generate a new client secret").
5. **Send back:** the **Client ID** and **Client Secret**.

---

### 4. Neon Postgres database (free)
Used for: storing donations, donor accounts, mentor reports, applications.

1. In the **Vercel dashboard** → your project → **Storage** → **Connect Store** → choose **Neon**.
2. Click **Create New** → keep defaults → **Create**.
3. Vercel auto-installs the database and injects `DATABASE_URL` into the project environment. No copy/paste needed.
4. **Nothing to send back** — Vercel handles it.

---

### 5. Clerk (auth — free)
Used for: donor login, mentor login, admin login, role-based access.

1. Go to https://clerk.com → sign up (free).
2. Create a new application called `Bridging Generations`.
3. Enable sign-in methods: **Email + password**, **Google**, **Magic link**.
4. Go to **API Keys** → copy the **Publishable Key** (`pk_test_…`) and **Secret Key** (`sk_test_…`).
5. **Send back:** both keys. We'll wire them into Vercel.

---

### 6. Stripe — apply for nonprofit discount (saves real money)
This is **separate from the Stripe account already in use** — it's a discount application.

1. Go to https://support.stripe.com/contact/email → choose "Pricing → Special pricing programs"
2. Request the **nonprofit discount**. Attach your 501(c)(3) IRS determination letter.
3. Expected outcome: Stripe drops the per-transaction fee from **2.9% + $0.30** to **2.2% + $0.30**.
   - On every $10,000 in donations, that saves the org ~$70.
   - On $100,000 in donations a year: ~$700 saved.
4. **Send back:** confirmation when the discount is applied (we don't need to wait — it doesn't block development).

While the discount is being processed, **also do this:**

5. In Stripe Dashboard → **Developers → API keys** → copy the **Publishable key** and **Secret key** (use TEST keys for now; we switch to LIVE keys at production launch).
6. **Send back:** both keys.

---

### 7. Resend (transactional email — free)
Used for: contact-form notifications, application receipts, donation receipts (Stripe also sends its own receipts).

1. Go to https://resend.com → sign up (free, 3,000 emails/month).
2. Add the org's domain: **Domains → Add Domain**. Enter `brigen.org` (or whichever domain we're using).
3. Follow Resend's DNS instructions — you'll add 3 records (SPF, DKIM, MX-like) at your domain registrar.
4. Wait for "Verified" status (usually <1 hour).
5. **API Keys → Create API Key** → copy the key (`re_…`).
6. **Send back:** the API key, and confirm the verified domain.

---

### 8. Push the repo to GitHub
Once GitHub is set up (step 1), we push this codebase to a new repo.

1. In GitHub (or the org from step 1): **New repository** → name it `bridging-generations` → keep it private → **Create**.
2. **Send back:** the repo URL (e.g. `https://github.com/bridginggenerations/bridging-generations`). We push the code.

---

### 9. Connect the GitHub repo to Vercel
Once the code is pushed.

1. In Vercel → **Add New → Project** → import the GitHub repo from step 8.
2. Click **Deploy**. The first build will probably fail until env vars are set — that's expected.
3. **Settings → Environment Variables** → paste in everything we send you (Clerk keys, Stripe keys, Resend key, Keystatic GitHub OAuth, etc.).
4. Redeploy.

---

## Summary checklist (for the owner)

- [ ] Confirm domain (`brigen.org` or other) and that we have DNS control
- [ ] Create GitHub account/org
- [ ] Create Vercel account, upgrade to Pro
- [ ] Create GitHub OAuth app for Keystatic — send **Client ID + Client Secret**
- [ ] Provision Neon DB via Vercel Marketplace (no action after this)
- [ ] Create Clerk account — send **Publishable Key + Secret Key**
- [ ] Apply for Stripe nonprofit discount + copy **Stripe Test Publishable + Secret Keys**
- [ ] Create Resend account, verify domain — send **API Key**
- [ ] Create GitHub repo, send URL
- [ ] Connect repo to Vercel, paste env vars

---

## What we (the dev team) do once everything above is in

1. Push the existing code to the new GitHub repo.
2. Wire all env vars into Vercel.
3. Start **Phase 1**: visual + content overhaul (homepage redesign, nav/footer, mission page, etc.).

Phase 1 doesn't require any of these credentials — we could technically start coding it now in parallel. But the rest of the phases (auth, dashboards, payments) all depend on the above being ready.

---

## Time to complete Phase 0

- Owner work: ~2–3 hours total of clicking through signups, plus waiting for DNS verification.
- Dev work: ~2 hours to wire env vars and verify the first deploy.
- **Realistic calendar time:** 1–3 days, depending on how fast the owner finishes the signups.

Once this is done, we never have to do it again.
