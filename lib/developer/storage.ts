import "server-only";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getContentRepo, getGithubToken, getStorageMode } from "./config";

// A single file mutation. `content` is the new file body (text or binary);
// when `remove` is set the file is deleted instead.
export type FileChange =
  | { path: string; content: string; binary?: false }
  | { path: string; content: Buffer; binary: true }
  | { path: string; remove: true };

const GH = "https://api.github.com";

async function gh(endpoint: string, init: RequestInit, token: string): Promise<unknown> {
  const res = await fetch(`${GH}${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${init.method ?? "GET"} ${endpoint} → ${res.status}: ${body}`);
  }
  return res.json();
}

/**
 * Commit a set of file changes to GitHub in one commit via the Git Data API.
 * One commit per save keeps the deploy history readable and atomic.
 */
async function commitToGithub(changes: FileChange[], message: string): Promise<void> {
  const token = getGithubToken();
  if (!token) throw new Error("DEVELOPER_GITHUB_TOKEN is not set");
  const { owner, name, branch } = getContentRepo();
  const repo = `/repos/${owner}/${name}`;

  const ref = (await gh(`${repo}/git/ref/heads/${branch}`, { method: "GET" }, token)) as {
    object: { sha: string };
  };
  const headSha = ref.object.sha;
  const headCommit = (await gh(`${repo}/git/commits/${headSha}`, { method: "GET" }, token)) as {
    tree: { sha: string };
  };

  // Build tree entries. New/updated files become blobs; removals are encoded
  // as a tree entry with sha:null, which deletes the path from the new tree.
  const treeItems: Array<Record<string, unknown>> = [];
  for (const change of changes) {
    if ("remove" in change) {
      treeItems.push({ path: change.path, mode: "100644", type: "blob", sha: null });
      continue;
    }
    const isBinary = change.binary === true;
    const blob = (await gh(
      `${repo}/git/blobs`,
      {
        method: "POST",
        body: JSON.stringify({
          content: isBinary
            ? (change.content as Buffer).toString("base64")
            : (change.content as string),
          encoding: isBinary ? "base64" : "utf-8",
        }),
      },
      token,
    )) as { sha: string };
    treeItems.push({ path: change.path, mode: "100644", type: "blob", sha: blob.sha });
  }

  const newTree = (await gh(
    `${repo}/git/trees`,
    { method: "POST", body: JSON.stringify({ base_tree: headCommit.tree.sha, tree: treeItems }) },
    token,
  )) as { sha: string };

  const newCommit = (await gh(
    `${repo}/git/commits`,
    { method: "POST", body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }) },
    token,
  )) as { sha: string };

  await gh(
    `${repo}/git/refs/heads/${branch}`,
    { method: "PATCH", body: JSON.stringify({ sha: newCommit.sha }) },
    token,
  );
}

/** Write changes directly to the working tree. Used in local/dev mode. */
async function commitToDisk(changes: FileChange[]): Promise<void> {
  for (const change of changes) {
    const abs = path.join(process.cwd(), change.path);
    if ("remove" in change) {
      await rm(abs, { force: true });
      continue;
    }
    await mkdir(path.dirname(abs), { recursive: true });
    if (change.binary) {
      await writeFile(abs, change.content);
    } else {
      await writeFile(abs, change.content, "utf-8");
    }
  }
}

/**
 * Persist content changes. In production (token present) this commits to GitHub
 * and triggers a redeploy; in dev it writes the working tree. The caller never
 * needs to know which.
 */
export async function persistChanges(changes: FileChange[], message: string): Promise<StorageMode> {
  const mode = getStorageMode();
  if (mode === "github") {
    await commitToGithub(changes, message);
  } else {
    await commitToDisk(changes);
  }
  return mode;
}

export type StorageMode = ReturnType<typeof getStorageMode>;
