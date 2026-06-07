import "server-only";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { getContentRepo, getGithubToken, getStorageMode } from "./config";

// Lists already-uploaded images so the owner can see and reuse them instead of
// re-uploading. Mirrors the storage module's dual mode:
//   - github → read the repo's git tree (the persistent source of truth)
//   - local  → walk public/images on disk (dev)
// Either way, the returned `src` is the public path (/images/...), which Vercel
// serves as a static asset regardless of the runtime filesystem.

export type MediaImage = { src: string; dir: string; name: string };

const IMG_RE = /\.(png|jpe?g|webp|gif|avif|svg)$/i;
const PUBLIC_IMAGES = "public/images";

async function listFromGithub(): Promise<MediaImage[]> {
  const token = getGithubToken();
  if (!token) return [];
  const { owner, name, branch } = getContentRepo();
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/git/trees/${branch}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { tree?: Array<{ path?: string; type?: string }> };
  const out: MediaImage[] = [];
  for (const node of data.tree ?? []) {
    if (node.type !== "blob" || !node.path) continue;
    if (!node.path.startsWith(`${PUBLIC_IMAGES}/`) || !IMG_RE.test(node.path)) continue;
    const rel = node.path.slice("public".length); // → /images/<dir>/<name>
    const parts = node.path.split("/");
    out.push({ src: rel, dir: parts[2] ?? "", name: parts[parts.length - 1] });
  }
  return out;
}

async function listFromDisk(): Promise<MediaImage[]> {
  const root = path.join(process.cwd(), PUBLIC_IMAGES);
  let dirs: string[] = [];
  try {
    const entries = await readdir(root, { withFileTypes: true });
    dirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  const out: MediaImage[] = [];
  await Promise.all(
    dirs.map(async (dir) => {
      try {
        const files = await readdir(path.join(root, dir));
        for (const file of files) {
          if (IMG_RE.test(file)) out.push({ src: `/images/${dir}/${file}`, dir, name: file });
        }
      } catch {
        // skip unreadable dir
      }
    }),
  );
  return out;
}

/** All uploaded images, grouped by folder, sorted by name. */
export async function listMediaImages(): Promise<Array<{ dir: string; images: MediaImage[] }>> {
  const all = getStorageMode() === "github" ? await listFromGithub() : await listFromDisk();
  const byDir = new Map<string, MediaImage[]>();
  for (const img of all) {
    const list = byDir.get(img.dir) ?? [];
    list.push(img);
    byDir.set(img.dir, list);
  }
  return [...byDir.entries()]
    .map(([dir, images]) => ({
      dir,
      images: images.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
}
