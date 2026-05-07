# Editing the site

This is the board's guide to editing bridginggenerations.org. You do not need to write code. Everything that changes on the public site — student records, projects, activities, testimonials, the home-page numbers, the mailing address, every editable string — lives in the Keystatic admin at `/keystatic`.

Developers edit code in GitHub; editors edit content in Keystatic. The two never overlap.

## Before you start

- You need an invited GitHub account. Ask the site admin if you don't have one.
- Use a desktop browser. The Keystatic admin works on mobile but the forms are long and editing is easier on a larger screen.

## How to open the admin

1. Go to your Vercel preview URL for this project: `https://<your-project>.vercel.app/keystatic`.
2. Sign in with your GitHub account. You only need to do this once per browser.
3. You'll see the admin sidebar with two groups:
   - **Collections** — records that come in batches: schools, students, projects, activities, blog posts, success stories, testimonials, gallery images, board members.
   - **Singletons** — one-of items: site settings, stats snapshot, donors page, donate page, contact page, terms page, navigation, footer.

Pick the thing you want to edit. Each field has a label and usually a one-line description explaining what it's for.

## Making a change

1. Click the collection or singleton you want to edit.
2. For collections, pick the existing entry or click **Add** to create a new one.
3. Fill in the fields. Required fields have a red asterisk.
4. Click **Save**.

**Save writes directly to the main branch.** Within about a minute, Vercel builds the site and the change appears on the preview URL. Once you've reviewed the preview, the change is live on the public site on the next production deploy — usually a few minutes later.

There's no separate "publish" step. If you save it, it ships.

## Images

Every image has two parts: the file and the **alt text**. The alt text is read aloud by screen readers and shown to anyone on a slow connection. It is required.

Write alt like you'd describe the photo to someone on the phone:

- Good: "Three students seated at a shared desk, reading from a shared textbook."
- Good: "Principal Mrs. Thaung standing by the school entrance at morning assembly."
- Bad: "Image of students." (redundant — screen readers already say "image")
- Bad: "photo1.jpg" (not helpful)

Never leave alt blank.

## Drafts

Blog posts, success stories, and activities each have a **Published** checkbox. Leave it unchecked while you're still drafting. The public site will not render unpublished entries. When you're ready, tick the box and save — the change goes live on the next deploy.

There is no scheduled publishing in v1. If a post must go live at a specific time, leave Published off and flip it on at that time.

## Consent and student photos

This is the most important editorial rule on the site.

A student's photo only renders on the public site when **all three** of these are true:

1. `consent.portraitReleaseStatus` is `granted`
2. `consent.consentScope` includes `website`
3. `consent.revokedAt` is empty

If **any** of those is false, the site renders a neutral illustrated placeholder instead. The student's first name and grade still appear; the photo does not.

### If a family withdraws consent

**This is urgent. Do it immediately, not tomorrow.**

1. Open the student's entry in the admin.
2. Set `consent.revokedAt` to today's date.
3. Save.

The revocation commits to `main` right away. The next Vercel build — usually within a minute or two — removes the photo from the public site. Watch the preview URL to confirm the placeholder has replaced the photo before you consider the revocation complete.

If Vercel is slow or the build fails, contact the site admin. Do not wait.

## Editing at the same time as someone else

Keystatic writes each edit as a git commit. If two editors save changes to the same entry within a minute or two of each other, one of them will hit a merge conflict that a developer has to resolve by hand.

To avoid that, we use a simple norm:

- Announce in the group chat before you start: "editing the board page for 30 min."
- Save and close when you're done.
- If you see the admin flag a conflict, stop and message the site admin.

Editing *different* entries at the same time is fine. Two people editing two different students at once produces two clean commits.

## Donor-page rules

`/donors` shows a count and an anonymous thank-you wall. It does **not** show a donor list.

- Never include a donor name in a thank-you message.
- Never include a specific dollar amount.
- Assume anything you type becomes public. If you aren't sure, don't paste it.

## Where fields end up

Not sure which page a field shows up on? Here's the quick map:

- **Site settings → copy** → nav CTA, footer tagline, donate buttons, contact form messages.
- **Site settings → mission full** → `/about` and the home mission band.
- **Site settings → EIN, mailing address, form 990 URL** → footer and `/about` Transparency section.
- **Stats snapshot** → the three big numbers on the home page and the hero headline copy.
- **Navigation / Footer** → the top nav and bottom of every page.

If in doubt, edit a value, save, and look at the preview URL.

## Getting unstuck

- **I can't find a field I need to edit.** Ask the site admin — the field may be hard-coded intentionally, or it may live in a collection or singleton you haven't opened yet.
- **The admin won't load.** Refresh. If still broken, try a different browser. If still broken, ping the site admin.
- **My change isn't showing on the site.** Wait 2 minutes, then reload the preview URL. If it's still not there after 5 minutes, ping the site admin — a build may have failed.
- **I made a mistake.** Every edit is a git commit; nothing is unrecoverable. Ask the admin to roll back and don't panic.

## Pre-launch content checklist

Before the site flips from preview to production, these Site settings fields must have real values — the public routes render defensive fallbacks when any of them is still a `[CONFIRM:]` stub, but the fallbacks are there for safety, not for launch.

- [ ] `ein` — the organization's real 9-digit EIN (replaces the `00-0000000` placeholder).
- [ ] `mailingAddress` — a real address or an explicit "we operate remotely" note.
- [ ] `form990Url` — link to the most recent Form 990 PDF (or leave blank; /about renders a neutral "filings appear here as soon as available" paragraph when empty).
- [ ] `candidProfileUrl` — GuideStar/Candid profile URL (same empty-is-fine rule).
- [ ] `socialLinks.{instagram, facebook, linkedin, youtube}` — fill in whichever the org actually uses; empty strings hide those links.
- [ ] Real board portraits for every `boardMember` if the currently-loaded placeholders aren't the board's final choice.
- [ ] Real gallery photos for `gallery/*` if any of the 11 CC0 samples should be replaced with the board's own images.

