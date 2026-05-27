# RUNBOOK — Bridging Generations production operations

Incident response, key rotation, and emergency contacts for the live site.
Keep this doc current as the platform changes — it's the source of truth
that on-call reaches for first.

---

## Table of contents

1. [Site is down or returns 500s](#1-site-is-down-or-returns-500s)
2. [Database lost / corrupted](#2-database-lost--corrupted)
3. [Stripe webhook stopped firing](#3-stripe-webhook-stopped-firing)
4. [Email delivery broken](#4-email-delivery-broken)
5. [Admin OTP locked out](#5-admin-otp-locked-out)
6. [Suspected leaked credentials](#6-suspected-leaked-credentials)
7. [Key rotation runbook](#7-key-rotation-runbook)
8. [Sentry + monitoring setup](#8-sentry--monitoring-setup)
9. [Emergency contacts](#9-emergency-contacts)
10. [Quick reference — every service](#10-quick-reference--every-service)

---

## 1. Site is down or returns 500s

**Symptoms:** brigen.org (or `helpful-truffle-babdd5.netlify.app`) shows
errors, blank pages, or stays in a loading state.

**First look — within 60 seconds:**

1. Open the Netlify dashboard → most recent deploy → check status
2. If "Failed", click into the deploy → read the build log
3. If the deploy is fine, check `/api/health` directly:
   ```
   curl https://brigen.org/api/health
   ```
   Expected: `{"ok": true, "db": "configured", "clerk": "configured"}`

**Common causes & fixes:**

| Symptom in log | Cause | Fix |
|---|---|---|
| `DATABASE_URL is not set` | Env var dropped from Netlify | Re-set in Netlify dashboard, redeploy |
| `Cannot read column "X"` (Postgres error) | Schema drift — code expects a column the DB doesn't have | Run `npm run db:push` from a local terminal with prod DATABASE_URL |
| `CLERK_SECRET_KEY missing` | Same as above for Clerk | Re-set in Netlify env, redeploy |
| 502 / 503 from Netlify edge | Build pipeline issue on Netlify's end | Check status.netlify.com; if Netlify-wide, wait it out |
| All routes return /sign-in redirect | Clerk webhook drifted from prod URL | Clerk dashboard → Webhooks → check endpoint URL matches `https://brigen.org/api/clerk/webhook` |

**Escalation:** if the site is down >15 min and root cause isn't clear,
post in the dev/ops channel and tag whoever's listed in §9.

---

## 2. Database lost / corrupted

**Symptoms:** all dashboards 500; data appears to be missing or stale;
errors mention "relation does not exist."

**Recovery — Neon point-in-time restore:**

1. Open Neon console → your project → Branches
2. Click "Create branch" → "From point in time" → pick a timestamp BEFORE
   the corruption
3. Test reads on the new branch via SQL Editor
4. If healthy, swap the new branch into prod by updating `DATABASE_URL`
   in Netlify to the new branch's connection string
5. Redeploy

**Important:** Neon free tier keeps 7 days of history. Past that, restore
isn't possible. Add a calendar reminder to bump to a paid tier if you
ever cross "data we can't afford to lose" threshold.

**Prevention:** weekly backup drill — restore to a throwaway branch,
confirm it boots, delete the branch. Track in a calendar.

---

## 3. Stripe webhook stopped firing

**Symptoms:** donations succeed in Stripe but don't appear in the donor
dashboard or admin overview.

**Diagnosis:**

1. Stripe dashboard → Developers → Webhooks → your endpoint
2. Recent deliveries — look for non-2xx responses
3. Click into the failed delivery — request body + response are shown

**Common causes:**

| Status | Cause | Fix |
|---|---|---|
| 4xx with "signature verification failed" | `STRIPE_WEBHOOK_SECRET` env var stale | Re-copy signing secret from Stripe dashboard → paste into Netlify env → redeploy |
| 5xx with "DATABASE_URL not set" | Env var dropped | Re-set in Netlify |
| 5xx with "donation duplicate" | Webhook delivered twice; idempotency working — actually fine | Mark as benign |

**Replay a delivery:** Stripe dashboard → the failed delivery → "Resend".
This re-runs the webhook handler so the donation lands in the DB.

---

## 4. Email delivery broken

**Symptoms:** signup-received, approval, rejection, or admin-OTP emails
not arriving.

**Diagnosis order:**

1. Resend dashboard → Logs — does the email show as "sent"?
2. If "sent": check the recipient's spam folder; if found, the issue is
   DNS (SPF/DKIM/DMARC). Re-verify in Resend dashboard → Domains.
3. If "queued" or "failed": likely RESEND_API_KEY issue. Re-set in
   Netlify env, redeploy.
4. If no log entry at all: the app didn't call `sendEmail`. Look at
   Netlify function logs around the time of the missing email.

**Fallback while debugging:**
- `sendEmail` falls back to stderr when `RESEND_API_KEY` is unset, so
  the email text shows up in Netlify function logs verbatim. Useful for
  developing without burning Resend quota.

---

## 5. Admin OTP locked out

**Symptoms:** an admin tries to sign in, gets stuck on /admin-verify,
either never receives the code or burns through all 5 attempts.

**Quick unlock from terminal:**

```bash
DATABASE_URL="$(netlify env:get DATABASE_URL --context production)" \
  npx -y postgres -- -c "DELETE FROM admin_otp_codes WHERE user_id = (SELECT id FROM users WHERE email = 'them@example.com');"
```

Or from Neon SQL Editor:
```sql
DELETE FROM admin_otp_codes
 WHERE user_id = (SELECT id FROM users WHERE email = 'them@example.com');
```

Next sign-in cycle will issue a fresh code with a clean attempt counter.

**If they're locked out of their own email too:** demote them via
`UPDATE users SET role = 'donor', status = 'active' WHERE email = '...'`
so they can at least sign in to the donor dashboard while you sort out
email access.

---

## 6. Suspected leaked credentials

If any of `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`,
`RESEND_API_KEY` may have leaked:

**Within 15 minutes:**

1. Rotate the affected secret first (see §7 below for each)
2. Update the env var in Netlify
3. Redeploy
4. Verify the site still works

**Within 24 hours:**

5. Audit logs — look for unusual access patterns
6. Notify affected parties if user data was reachable
7. Document the incident with date / cause / what changed

---

## 7. Key rotation runbook

Every external service supports concurrent old + new keys for a short
window. Always **add the new key first**, update env, deploy, **then**
revoke the old key — never the reverse.

### Clerk
1. Clerk dashboard → API Keys → Create new secret key
2. Netlify env → set `CLERK_SECRET_KEY` to the new value
3. Redeploy
4. Confirm sign-in flow works in an incognito window
5. Clerk dashboard → revoke the old key

### Stripe
1. Stripe dashboard → Developers → API keys → Roll secret key
2. Stripe gives a 24-hour grace window where both keys work
3. Update `STRIPE_SECRET_KEY` in Netlify
4. Redeploy
5. Make a $5 test donation in live mode to confirm
6. Old key auto-expires after the window

For webhook secret:
1. Stripe → Webhooks → endpoint → "Roll signing secret"
2. Both old + new accepted for 24 hours
3. Update `STRIPE_WEBHOOK_SECRET` in Netlify, redeploy
4. Old auto-expires

### Resend
1. Resend dashboard → API Keys → create new
2. Update `RESEND_API_KEY` in Netlify, redeploy
3. Send a test email to confirm
4. Revoke the old key

### Neon (DATABASE_URL)
1. Neon → Roles → reset password for the app role
2. Copy the new connection string
3. Update `DATABASE_URL` in Netlify env (production + branch-deploy if set there)
4. Redeploy
5. Confirm `/api/health` returns `db: configured`
6. Note: Neon doesn't keep both passwords live — there's a few-second
   downtime as Netlify deploys. Schedule for low-traffic time if avoidable.

---

## 8. Sentry + monitoring setup

Sentry isn't yet installed in the codebase — the wiring is documented
here so you can add it in ~15 minutes when ready.

### Step 1 — Sentry account (free for nonprofits)

1. Sign up at https://sentry.io/welcome/ — confirm with your org email
2. Sentry has a nonprofit discount; mention `501(c)(3)` in the welcome
   email to get free Business tier
3. Create a new project: platform = "Next.js"
4. Sentry shows you the DSN — copy it

### Step 2 — install + wire up

From a terminal in the repo:

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

The wizard will:
- Add `sentry.client.config.ts`, `sentry.server.config.ts`,
  `sentry.edge.config.ts`
- Add `next.config.ts` mods to wrap the Next config with
  `withSentryConfig`
- Add `instrumentation.ts` for Node runtime

Review the generated files. The wizard is good but sometimes overzealous
on `tracesSampleRate` — set it to `0.1` (10% of requests) in
production, `1.0` in dev.

### Step 3 — env vars

In Netlify env (production + branch-deploy + dev):

```
NEXT_PUBLIC_SENTRY_DSN=<dsn from step 1>
SENTRY_AUTH_TOKEN=<generated by wizard>
SENTRY_ORG=<your-org-slug>
SENTRY_PROJECT=<your-project-slug>
```

### Step 4 — test

Add a deliberate throw somewhere temporary:

```ts
if (process.env.NODE_ENV === "development") {
  throw new Error("Sentry smoke test");
}
```

Reload the page → check Sentry → confirm the error showed up → remove
the throw.

### Step 5 — UptimeRobot

1. Sign up at https://uptimerobot.com (free tier: 50 monitors)
2. Add monitor:
   - URL: `https://brigen.org/api/health`
   - Type: HTTP(s)
   - Interval: 5 minutes
3. Add alert contact (email or SMS)
4. Confirm the first ping shows green

---

## 9. Emergency contacts

| Role | Who | Reach via |
|---|---|---|
| Project lead / owner | Wasif Karim | <wasif.karim.2026@owu.edu> |
| Org email | Bridging Generations | <bridginggeneration20@gmail.com> |
| Dev (Khokon, mentor calls + i18n) | Khokon Barua | `@Khokon0123` on GitHub |
| Stripe support | Stripe | https://support.stripe.com |
| Netlify support | Netlify (Pro) | <support@netlify.com> |
| Neon support | Neon | https://neon.tech/contact |
| Clerk support | Clerk | <support@clerk.com> |

---

## 10. Quick reference — every service

| Service | Console | Notes |
|---|---|---|
| Netlify | https://app.netlify.com → `helpful-truffle-babdd5` | site_id `d1b0b2bf-4503-488f-bf6b-7d29f981e47b` |
| Netlify mirror | `endearing-sunshine-f80bb7` | duplicate site; decide which to keep |
| Neon Postgres | https://console.neon.tech | DATABASE_URL is secret-flagged |
| Clerk auth | https://dashboard.clerk.com | CLERK_SECRET_KEY + CLERK_WEBHOOK_SECRET |
| Stripe | https://dashboard.stripe.com | Currently TEST mode; cutover to LIVE pending |
| Resend | https://resend.com | RESEND_API_KEY; from address `RESEND_FROM_EMAIL` |
| Sentry | https://sentry.io | Not yet installed — see §8 |
| UptimeRobot | https://uptimerobot.com | Not yet configured — see §8 |
| GitHub repo | https://github.com/Wasif-Karim03/Project-02---Bridging-Generations | |
| Cloudflare DNS | login at cloudflare.com | for brigen.org DNS records |

### Bootstrap admin
`BOOTSTRAP_ADMIN_EMAIL=wasif.karim.2026@owu.edu` is set in Netlify
production env. The next signup with that email auto-promotes to admin.
For subsequent admins, see `OWNER-MANUAL.md` § 9.

### Helper scripts on `main`
- `npm run grant-admin <email>` — promote a user to admin
- `npm run reset-test-data` — wipe DB + Clerk users (dry-run by default,
  requires `--confirm` to actually delete)
