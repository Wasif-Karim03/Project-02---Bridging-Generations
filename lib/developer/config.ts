import "server-only";

// Central config + env reads for the password-gated content editor ("developer
// page"). The owner signs in with a single hardcoded password and edits site
// content; saves are persisted either to the local filesystem (dev) or by
// committing to GitHub (prod on Vercel), mirroring how Keystatic itself splits
// local vs GitHub storage.

/** The hardcoded editor password. Required for the page to function. */
export function getDeveloperPassword(): string | null {
  return process.env.DEVELOPER_PASSWORD || null;
}

/**
 * Secret used to sign the session cookie. Falls back to the password itself so
 * the editor still works if only DEVELOPER_PASSWORD is set, but a dedicated
 * secret is strongly preferred (rotating it logs everyone out).
 */
export function getSessionSecret(): string {
  return (
    process.env.DEVELOPER_SESSION_SECRET ||
    process.env.DEVELOPER_PASSWORD ||
    "dev-editor-insecure-fallback"
  );
}

export type StorageMode = "github" | "local";

/**
 * GitHub mode is used whenever a content token is present (always the case in
 * production). Without it we fall back to writing the repo's working tree on
 * disk — correct for local development and how an editor would behave when run
 * with `next dev`.
 */
export function getStorageMode(): StorageMode {
  return process.env.DEVELOPER_GITHUB_TOKEN ? "github" : "local";
}

export type RepoTarget = { owner: string; name: string; branch: string };

/**
 * Repo the editor commits content to in GitHub mode. Defaults to the repo Vercel
 * actually deploys the production site from.
 *
 * Confirmed 2026-05-29 via the GitHub deployments API: vercel[bot] posts its
 * Production/Preview deployment statuses on `Wasif-Karim03/Project-02---Bridging-Generations`
 * (branch `main`), while `Bamyani1/bridging-generations` (the repo keystatic.config.ts
 * points at) has none — so that Keystatic target is stale and Keystatic edits there
 * would never deploy. This editor commits to the live repo instead.
 */
export function getContentRepo(): RepoTarget {
  const slug =
    process.env.DEVELOPER_CONTENT_REPO || "Wasif-Karim03/Project-02---Bridging-Generations";
  const [owner, name] = slug.split("/");
  return {
    owner: owner ?? "Wasif-Karim03",
    name: name ?? "Project-02---Bridging-Generations",
    branch: process.env.DEVELOPER_CONTENT_BRANCH || "main",
  };
}

export function getGithubToken(): string | null {
  return process.env.DEVELOPER_GITHUB_TOKEN || null;
}
