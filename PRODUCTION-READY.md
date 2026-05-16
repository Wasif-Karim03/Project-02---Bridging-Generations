# Production-ready checklist — Bridging Generations

Exhaustive list of everything that needs to be true before we ship this site
to the owner. Work items grouped by area and tagged with status. Update the
status as we go.

**Status legend**
- ✅ Done — verified working
- 🟡 Partial — code written but not fully tested / wired
- ❌ Not started — coding task ahead
- 🔵 Owner action — the org needs to do this (account creation, content, etc.)
- ⏭ Deferred — explicitly punted to post-launch

**Priority legend**
- 🔥 Blocker — site cannot launch without this
- ⚠️ High — needed for a quality launch
- · Polish — nice to have, not blocking

---

## A. Functional completeness

### Public marketing site
- ✅ Homepage with hero carousel, programs grid, spotlight, CTA footer
- ✅ /students directory + per-student profile pages
- ✅ /mentors directory
- ✅ /donors public wall (anonymity-respecting)
- ✅ /projects + /projects/scholarships
- ✅ /activities, /gallery, /blog, /testimonials, /success-stories
- ✅ /about with board, history, mission/vision
- ✅ /contact form with audience triage
- ✅ /donation-journey explainer
- ✅ /terms
- ✅ **`/privacy` policy page** — full nonprofit privacy policy covering Stripe/Clerk/Neon/Resend/Netlify processors, children's data, retention, GDPR/CCPA rights. Editable via Keystatic.
- ❌ ⚠️ **Cookie consent banner** — needed if analytics is added; some jurisdictions require disclosure even without
- ⏭ Bengali toggle on dashboard surfaces (currently public site only)

### Donor flow
- ✅ /be-a-donor entry page
- ✅ /sign-in + /sign-up Clerk wrappers
- ✅ Donor dashboard with stats, sponsored students, donation history
- ✅ Donor ID (BG-XXXXXXXX) displayed + in welcome email
- ✅ Donor profile editor (anonymity, dedication, photo)
- ✅ Per-donation PDF receipt (auth-gated)
- ✅ "Browse students" section with sponsor CTAs
- 🟡 ⚠️ **Recurring donation cancellation flow** — Stripe handles in their portal, but no in-app button yet
- ❌ · Donor-side refund request (route to email)
- ❌ · Email preferences (opt out of non-essential emails)

### Student flow
- ✅ /student-signup → /student-signup/details two-step
- ✅ Application form with guardian phone, emergency contact, NID, life target
- ✅ /student-login + dashboard with three states (no app / pending / approved)
- ✅ Student ID (STU-XXXXXXXX) displayed + in confirmation/approval emails
- ✅ Sponsor list on student dashboard with donor anonymity honored
- 🟡 ⚠️ **Student ID as a sign-in identifier** — currently display-only; needs Clerk backend SDK to set username
- ❌ · Student profile editor (update phone, life goal, etc. post-approval)
- ❌ · Student withdrawal / deactivation flow

### Mentor flow
- ✅ /mentor-signup → /mentor-login
- ✅ Mentor dashboard with assigned students
- ✅ Weekly report submission (env-gated)
- 🟡 ⚠️ **Mentor approval email** — currently signup just lands on donor dashboard with "pending" banner; admin promotes role manually without an email going out
- ❌ · Mentor profile editor (bio, availability, subjects)

### Admin flow
- ✅ /admin-login with dedicated dark-themed Clerk SignIn
- ✅ Admin layout with section nav + sign-out + admin badge
- ✅ Application queue (scholarship + mentor + student)
- ✅ Donor list with real DB join + drill-in detail page (edit profile, change role)
- ✅ Mentor list + detail with student assignment management
- ✅ Student list + Keystatic slug linker + approval email
- ✅ Users & roles management
- ✅ XLSX exports for students, teachers, donors
- 🟡 ⚠️ **First-admin bootstrap is manual** — owner must UPDATE role in Neon SQL. Could add a one-time `npm run grant-admin` script.
- ❌ · Donation refund interface (route admin to Stripe dashboard for now)
- ❌ · Activity log / audit trail of admin actions
- ❌ · Bulk operations (approve all, export filtered, etc.)

### Payments
- ✅ /donate with Stripe Checkout integration
- ✅ Stripe webhook with signature verification
- ✅ Donor attribution via Clerk session metadata
- ✅ Donation thank-you email
- ✅ Email fallback when donor signed up after donating (match by email)
- ❌ ⚠️ **bKash (Bangladesh mobile money)** — pluggable architecture in place, no provider wired yet. Deferred pending merchant account approval.
- ❌ · Dispute / chargeback notification handling

### Emails (transactional via Resend)
- ✅ Donor welcome email (Clerk webhook)
- ✅ Student application confirmation
- ✅ Student approval email
- ✅ Donation thank-you (one-time + recurring)
- 🟡 **Student rejection email** — admin can unlink, but there's no explicit "reject with reason" flow
- ❌ · Mentor approval email
- ❌ · Password-reset email (Clerk handles automatically, just verify branding)
- ❌ · Newsletter / mass-email tooling (defer — owner can use Resend directly for now)

---

## B. Content readiness (🔵 Owner action)

- ❌ 🔥 **Real EIN** in site settings (currently shows placeholder)
- ❌ 🔥 **Mailing address** verified in site settings
- ❌ 🔥 **Contact email** verified
- ❌ 🔥 **Phone number** verified
- 🟡 **Board members** — 5 still have `[CONFIRM:]` markers in their YAML
- 🟡 **Student records** — 23 in Keystatic; verify which are real vs demo
- ❌ **Project records** — verify no `[PLACEHOLDER]` projects remain
- ❌ **School records** — verify no placeholder schools
- ❌ **Form 990 URL** — add once IRS filing is published
- ❌ **Candid/GuideStar profile URL**
- ❌ **Social media URLs** in site settings
- ❌ **Real portraits** for all 11 team members (URLs preserved in scrape doc)
- ❌ **HSC/SSC spotlight band** — toggle on/off in `studentsPage` for active registration cycle
- ❌ **Privacy policy text** — owner-authored or legal-counsel-reviewed
- ❌ **Cookie disclosure** — only if analytics goes live

---

## C. Service setup (🔵 Owner action — all free tier)

### Netlify (hosting)
- ❌ 🔥 Sign up with owner Gmail
- ❌ 🔥 Connect GitHub repo
- ❌ 🔥 Deploy succeeds, gets a `*.netlify.app` URL
- ❌ ⚠️ Custom domain `brigen.org` pointed at Netlify
- ❌ ⚠️ SSL cert auto-provisions (let's encrypt via Netlify)

### Neon (Postgres)
- ❌ 🔥 Sign up + create project
- ❌ 🔥 `DATABASE_URL` pasted into Netlify env
- ❌ 🔥 `npm run db:push` to create schema in production DB
- ❌ ⚠️ Daily backup schedule confirmed (Neon's auto-backup on free tier)

### Clerk (auth)
- ❌ 🔥 Sign up + create application
- ❌ 🔥 Enable Email + Phone + Password under Authentication strategies
- ❌ 🔥 Paste publishable + secret keys in Netlify env
- ❌ 🔥 Create webhook endpoint → /api/clerk/webhook → paste signing secret
- ❌ ⚠️ Enable Username strategy + wire Clerk backend SDK to set STU-/BG- codes as usernames

### Stripe (payments)
- ❌ 🔥 Sign up + complete account info (nonprofit profile)
- ❌ 🔥 Paste test keys into Netlify env for staging
- ❌ 🔥 Create webhook endpoint → /api/stripe/webhook
- ❌ ⚠️ Apply for nonprofit discount (2.2% vs 2.9% fee)
- ❌ 🔥 Switch to live keys before launch + new live webhook
- ❌ ⚠️ Configure receipt branding in Stripe dashboard

### Resend (email)
- ❌ 🔥 Sign up
- ❌ 🔥 Add `brigen.org` domain + add SPF/DKIM/DMARC DNS records
- ❌ 🔥 Domain verified status confirmed
- ❌ 🔥 API key pasted into Netlify env as `RESEND_API_KEY`
- ❌ 🔥 `RESEND_FROM_EMAIL` set (e.g. `noreply@brigen.org`)
- ❌ ⚠️ Test email sent to a real inbox + verified deliverability

---

## D. Security hardening

- ✅ Content Security Policy headers
- ✅ Strict-Transport-Security
- ✅ X-Content-Type-Options nosniff
- ✅ Referrer-Policy strict-origin-when-cross-origin
- ✅ Permissions-Policy (camera/mic/geolocation denied)
- ✅ Honeypot on all 5 public forms
- ✅ Webhook signature verification (Stripe + Clerk via svix)
- ✅ Role-based access control (RBAC) on all dashboard routes
- ✅ Admin layout enforces requireRole("admin") for the whole subtree
- ✅ Receipt route ownership check (donor or admin only)
- ✅ Donor anonymity respected on /donors public wall + student dashboards
- 🟡 ⚠️ **Rate limiting is in-memory only** — won't survive serverless cold starts or sync across instances. Switch to Upstash Redis (free tier) for production.
- ❌ ⚠️ **Real production secrets management** — currently env vars only. Consider 1Password or similar for the owner.
- ❌ · 2FA enforcement on admin accounts (Clerk supports, needs flag)
- ❌ · Account lockout after N failed login attempts (Clerk handles, verify config)
- ❌ · CSRF token verification on server actions (Next 14+ has built-in protection; verify)
- ❌ · SQL injection — Drizzle parameterizes everything, but worth a final review of any sql`...` raw strings

---

## E. Legal / compliance

- ✅ /terms exists with MDX body
- ✅ **/privacy** route + content (mirrors /terms structure; editable via Keystatic singleton)
- ❌ 🔥 **501(c)(3) disclosure** on every donate flow (mostly there; verify "tax-deductible to the extent allowed by law" appears on receipts + donate page)
- ❌ ⚠️ **EIN displayed in footer** (currently a Keystatic field; verify a real value is set)
- ❌ ⚠️ **Annual Form 990 link** when published
- ❌ ⚠️ **Donor data retention policy** documented
- ❌ ⚠️ **Cookie consent banner** if analytics or other non-essential cookies are added
- ❌ · GDPR-aware donor consent flow (only matters if EU donors give regularly)
- ❌ · CCPA disclosure (only matters if California donors)
- ✅ PCI compliance delegated to Stripe (we never see card data)

---

## F. Accessibility

- ✅ Skip-to-main-content link
- ✅ WCAG 2.5.8 target size (24×24 minimum)
- ✅ WCAG 1.4.3 color contrast (donate buttons fixed)
- ✅ Reduced-motion respected (Lenis disabled entirely, motion components honor pref)
- ✅ All forms have associated labels + aria-describedby
- ✅ Honeypot fields aria-hidden
- ✅ Error messages role="alert" + aria-live
- ✅ axe-core tests passing on home, donors, gallery, donate, contact, terms
- ❌ ⚠️ **axe tests for new auth + dashboard routes** — currently none cover /sign-in, /dashboard/*, /student-signup/details
- ❌ ⚠️ **Real screen-reader test** on a phone with VoiceOver / TalkBack
- ❌ · Skip-link sometimes loses focus on route change (verify)
- ❌ · Keyboard-only navigation walkthrough on every dashboard

---

## G. Performance

- ✅ Production build succeeds in ~8s
- ✅ Image optimization via Next Image
- ✅ Static generation where possible (sitemap, opengraph images, robots)
- ❌ ⚠️ **Lighthouse audit on the deployed site** (90+ on Performance, Accessibility, Best Practices, SEO)
- ❌ · Bundle analyzer run + unused-dep removal sweep
- ❌ · `next-mdx-remote@6.0.0` usage check — listed in deps but might be unused
- ❌ · Font loading strategy (currently inline subset — verify CLS is acceptable)
- ❌ · CDN cache headers on static assets (Netlify defaults are good; verify in netlify.toml)

---

## H. SEO

- ✅ /sitemap.xml generates dynamically
- ✅ /robots.txt with correct allow/disallow
- ✅ OpenGraph images on key routes
- ✅ Meta titles + descriptions on every page
- ✅ JSON-LD breadcrumbs on most routes
- ❌ ⚠️ **NonprofitOrganization schema.org** markup on /about
- ❌ · Canonical URLs verified everywhere
- ❌ · Submit sitemap to Google Search Console after launch
- ❌ · Add `<link rel="alternate" hreflang="bn"`> for Bengali pages

---

## I. Testing

- ✅ 346 unit tests passing
- ✅ Vitest + jsdom for component tests
- ✅ Playwright e2e for marketing routes
- ✅ axe-core a11y tests on key routes
- ❌ ⚠️ **e2e test for full donor signup → donate → receipt flow**
- ❌ ⚠️ **e2e test for student signup → application → admin-approval flow**
- ❌ ⚠️ **e2e test for admin role-change flow**
- ❌ · Visual regression / snapshot tests on hero, dashboards, receipts
- ❌ · Cross-browser run (currently Chromium only; add WebKit + Firefox)
- ❌ · Real-device test on iOS Safari + Android Chrome

---

## J. Monitoring & operations

- ✅ /api/health endpoint for uptime monitors
- ❌ ⚠️ **Error tracking** — wire up Sentry or similar (Sentry has nonprofit free tier)
- ❌ ⚠️ **Uptime monitor** — UptimeRobot / Better Stack (free tier) pinging /api/health every 5 min
- ❌ · Log aggregation — Netlify logs are 24h-only; consider Logflare / Axiom for retention
- ❌ · Analytics — Plausible (paid but cheap, nonprofit discount) or Vercel Analytics (deferred since we left Vercel)
- ❌ · Database backup verification — Neon does auto-backup, but verify restore works
- ❌ · Stripe Radar rules tuned for nonprofit fraud patterns (low priority)

---

## K. Owner handoff

- ✅ README.md with stack + dev setup
- ✅ LAUNCH-CHECKLIST.md with click-by-click production setup
- ✅ AGENTS.md with collaborator + AI-agent workflow
- ❌ 🔥 **Owner manual** — how to log in, approve students, view donations, edit content via Keystatic
- ❌ ⚠️ **Video walkthrough** (5-10 min screen recording) of the admin panel + Keystatic CMS
- ❌ ⚠️ **Runbook** — what to do when:
  - Site is down (check Netlify, Neon, Clerk statuses in order)
  - Email not delivering (check Resend logs + domain verification)
  - Donations not appearing (check Stripe webhook delivery status)
  - User reports a bug (how to triage, where to look)
- ❌ ⚠️ **Credentials handoff** — password manager (1Password vault) with all service logins
- ❌ ⚠️ **Emergency contacts** — who to call if something breaks (developer email, Stripe support, etc.)

---

## L. Polish & UX edge cases

- ✅ /not-found.tsx
- ✅ /error.tsx (per-route boundary)
- ✅ /global-error.tsx (root-layout boundary)
- ✅ /loading.tsx (top-level)
- ✅ Empty states on dashboards (no donations / no sponsors / no students yet)
- ✅ Form validation feedback (role="alert" panels)
- 🟡 **Success states** — application confirmation page, donation thank-you page exist; verify all transitions feel finished
- ❌ · Per-route loading.tsx for dashboard sections (better skeletons)
- ❌ · Print stylesheet for PDF receipts (if owner ever prints from the dashboard)
- ❌ · Better mobile keyboard handling on long forms (already added inputMode, verify on real device)
- ❌ · Toast notifications for success/error actions (currently inline; consider a toast for "Profile saved")

---

## M. Edge cases / "what if"

- ✅ What if DB is down? → All queries env-gate and return empty; site degrades to preview mode
- ✅ What if Clerk is down? → Sign-in pages show "Setup pending" fallback
- ✅ What if email fails? → Promise.allSettled, doesn't break the parent action
- ✅ What if webhook signing secret is wrong? → 400 returned, event rejected, logged
- ✅ What if user has multiple roles? → ROLE_RANK hierarchy handles donor < mentor < admin
- ❌ ⚠️ **What if donor changes email mid-flow?** Clerk handles email change; verify users.email syncs via user.updated webhook (it does in code; needs real test)
- ❌ ⚠️ **What if student is rejected after submission?** No flow yet — they sit in "Application under review" forever
- ❌ · What if a sponsored student withdraws? Admin can unlink; verify donor's "Students you support" still works historically
- ❌ · What if Stripe webhook is replayed (duplicate event)? `externalReference` is unique, but verify no double-insert
- ❌ · What if a user signs up with the same email twice? Clerk prevents at their layer
- ❌ · What if the org loses 501(c)(3) status? No code path; manual action

---

## N. Domain & DNS (🔵 Owner action)

- ❌ 🔥 `brigen.org` DNS at Netlify (apex A record + www CNAME)
- ❌ 🔥 SPF + DKIM + DMARC records added for Resend email
- ❌ ⚠️ DMARC policy set to `p=quarantine` then `p=reject` after monitoring period
- ❌ ⚠️ MX records configured if owner wants to receive email at brigen.org addresses (separately from Resend's sending-only setup)

---

## O. Final pre-launch sequence

This is the order of operations once everything above is checked off:

1. ❌ Switch Stripe from test keys to live keys (in Netlify env)
2. ❌ Create new Stripe webhook endpoint with live signing secret
3. ❌ Confirm Resend domain is verified
4. ❌ Send test transactional emails end-to-end (signup, donation, application)
5. ❌ Make a real $5 donation through the live site — verify receipt + dashboard update
6. ❌ Submit a real student application — verify confirmation email
7. ❌ Approve the test student — verify approval email
8. ❌ Bookmark `/admin-login` for the owner; share password-manager link
9. ❌ Submit sitemap to Google Search Console
10. ❌ Announce launch on owner's existing brigen.org / social channels

---

## How this list will be worked

Each unchecked item is a discrete task. We'll work top-down by priority:

1. **🔥 Blockers** first (legal pages, real EIN, service setup)
2. **⚠️ High-priority** next (rate limiting, e2e tests, owner manual, error tracking)
3. **Polish** items as time allows

Update this file as items are completed — bump ❌ → 🟡 → ✅ and commit. Keep
the list as the single source of truth for what's left.
