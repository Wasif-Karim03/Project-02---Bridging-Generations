# Site editor (`/developer`)

A password-gated content editor so the site owner can update **all the text and
images** on the public site without a GitHub or Clerk account. It edits the same
`content/` files Keystatic uses, so the public pages need no changes.

- **URL:** `https://<site>/developer`
- **Sign in:** one hardcoded password (no email, no GitHub).
- **What it edits:** every Keystatic collection + singleton — home stats & hero,
  site settings, all page text, students, schools, projects, team members,
  teachers, testimonials, gallery, blog posts, success stories, donor profiles.

## How saving works

| Environment | Where saves go |
| --- | --- |
| Production (Vercel) | Commits the changed files to GitHub → Vercel redeploys → the live site updates in ~1 minute. The owner never touches GitHub. |
| Local `next dev` | Writes the files directly into the working tree (development only). |

The mode is chosen automatically: if `DEVELOPER_GITHUB_TOKEN` is set it uses
GitHub; otherwise it writes to disk.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DEVELOPER_PASSWORD` | **Yes** | The password the owner types to sign in. |
| `DEVELOPER_SESSION_SECRET` | Recommended | Random string used to sign the session cookie. Rotating it logs everyone out. Falls back to `DEVELOPER_PASSWORD` if unset. |
| `DEVELOPER_GITHUB_TOKEN` | **Yes (prod)** | GitHub token used to commit content. Without it, the editor runs in local-only mode and won't update the live site. |
| `DEVELOPER_CONTENT_REPO` | No | `owner/name` of the repo to commit to. Defaults to `Wasif-Karim03/Project-02---Bridging-Generations` — the confirmed deploy repo (see below). Leave unset unless that changes. |
| `DEVELOPER_CONTENT_BRANCH` | No | Branch to commit to. Defaults to `main` (the production branch). Saving therefore publishes to production immediately, by design. |

### Creating the GitHub token

1. GitHub → Settings → Developer settings → **Fine-grained tokens** → Generate new.
2. **Repository access:** only the repo Vercel deploys from.
3. **Permissions:** Repository → **Contents: Read and write**.
4. Copy the token into `DEVELOPER_GITHUB_TOKEN` in Vercel.

> ✅ **Deploy repo confirmed.** Vercel deploys the production site
> (`bridging-generations.vercel.app`) from
> **`Wasif-Karim03/Project-02---Bridging-Generations`**, branch `main`. Verified
> 2026-05-29 via the GitHub deployments API — `vercel[bot]` posts Production
> deployment statuses there, and `Bamyani1/bridging-generations` (the repo
> `keystatic.config.ts` points at) has **none**. So the default is correct and
> you can leave `DEVELOPER_CONTENT_REPO` unset.
>
> 🐞 **Side note:** because `keystatic.config.ts` targets the stale
> `Bamyani1/bridging-generations`, the existing `/keystatic` editor's saves
> wouldn't reach the live site in production. This `/developer` editor commits to
> the correct repo. Consider fixing `keystatic.config.ts` to match (separate task).

## Security notes

- The session cookie is `httpOnly`, `secure` in production, and HMAC-signed; it
  expires after 7 days.
- The `/developer` pages and `/api/developer/*` routes are all gated on the
  session — only the login endpoint is reachable signed-out.
- The editor commits content + `public/images/*` only. It cannot run code or
  touch secrets.

## Known limitation

Most fields (text, numbers, dates, selects, images, lists, nested data) and the
**primary** long-form body of each page (privacy, terms, blog posts, success
stories, project/scholarship/student rules) are fully supported and verified.

A few *secondary* long-form markdown fields — `scholarshipsPage.eligibility` and
`school.overview` — are written as sibling `.mdx` files. If a future Keystatic
version reads those differently they may not render; the primary bodies are the
common case and are confirmed working. No save can corrupt the file format.
