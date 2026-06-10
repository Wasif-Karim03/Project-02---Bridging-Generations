import "server-only";
import { getContentRepo, getGithubToken } from "@/lib/developer/config";

// Free image hosting: commit an uploaded image into the repo and serve it from
// the jsDelivr CDN, pinned to the commit so it's live instantly with no deploy
// lag and no broken-image window. Used for donor and project photos. No paid
// storage, no API keys beyond the GitHub content token already configured.

const GH = "https://api.github.com";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function extForImage(type: string): string | null {
  return EXT_BY_TYPE[type] ?? null;
}

export function isRepoImageConfigured(): boolean {
  return Boolean(getGithubToken());
}

async function gh<T>(endpoint: string, init: RequestInit, token: string): Promise<T> {
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
    throw new Error(`GitHub ${init.method ?? "GET"} ${endpoint} → ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Commit a binary image to the repo at `filePath` and return its public CDN URL.
 * Throws if the GitHub token isn't configured.
 */
export async function commitImageToRepo(
  filePath: string,
  bytes: Buffer,
  message: string,
): Promise<string> {
  const token = getGithubToken();
  if (!token) throw new Error("Image uploads aren't configured (DEVELOPER_GITHUB_TOKEN missing).");
  const { owner, name, branch } = getContentRepo();
  const repo = `/repos/${owner}/${name}`;

  const ref = await gh<{ object: { sha: string } }>(
    `${repo}/git/ref/heads/${branch}`,
    { method: "GET" },
    token,
  );
  const headSha = ref.object.sha;
  const headCommit = await gh<{ tree: { sha: string } }>(
    `${repo}/git/commits/${headSha}`,
    { method: "GET" },
    token,
  );
  const blob = await gh<{ sha: string }>(
    `${repo}/git/blobs`,
    { method: "POST", body: JSON.stringify({ content: bytes.toString("base64"), encoding: "base64" }) },
    token,
  );
  const tree = await gh<{ sha: string }>(
    `${repo}/git/trees`,
    {
      method: "POST",
      body: JSON.stringify({
        base_tree: headCommit.tree.sha,
        tree: [{ path: filePath, mode: "100644", type: "blob", sha: blob.sha }],
      }),
    },
    token,
  );
  const commit = await gh<{ sha: string }>(
    `${repo}/git/commits`,
    { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [headSha] }) },
    token,
  );
  await gh(
    `${repo}/git/refs/heads/${branch}`,
    { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) },
    token,
  );

  return `https://cdn.jsdelivr.net/gh/${owner}/${name}@${commit.sha}/${filePath}`;
}
