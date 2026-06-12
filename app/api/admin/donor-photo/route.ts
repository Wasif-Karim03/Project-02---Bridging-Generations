import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { updateFeaturedDonor } from "@/lib/db/queries/featuredDonors";
import { getContentRepo, getGithubToken } from "@/lib/developer/config";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const GH = "https://api.github.com";

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
    throw new Error(
      `GitHub ${init.method ?? "GET"} ${endpoint} → ${res.status}: ${await res.text()}`,
    );
  }
  return res.json() as Promise<T>;
}

// Upload a donor photo: commit the image into the repo and store a CDN URL
// pinned to that exact commit (so it serves instantly, with no deploy lag and
// no broken-image window). Admin-only.
export async function POST(request: Request) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const token = getGithubToken();
  if (!token) {
    return NextResponse.json(
      { error: "Photo uploads aren't configured (DEVELOPER_GITHUB_TOKEN missing)." },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const donorId = String(form.get("donorId") ?? "").trim();
  const file = form.get("file");
  if (!donorId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing donor or file." }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Please use a JPG, PNG, WebP, or GIF image." },
      { status: 400 },
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) return NextResponse.json({ error: "Empty file." }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 });
  }

  const { owner, name, branch } = getContentRepo();
  const repo = `/repos/${owner}/${name}`;
  const safeId = donorId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 12);
  const filePath = `public/images/donors/${safeId}-${Date.now()}.${ext}`;

  try {
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
      {
        method: "POST",
        body: JSON.stringify({ content: bytes.toString("base64"), encoding: "base64" }),
      },
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
      {
        method: "POST",
        body: JSON.stringify({
          message: `donor: photo ${filePath}`,
          tree: tree.sha,
          parents: [headSha],
        }),
      },
      token,
    );
    await gh(
      `${repo}/git/refs/heads/${branch}`,
      { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) },
      token,
    );

    // jsDelivr serves the committed file from a CDN, pinned to this commit so
    // the URL is immutable and live immediately.
    const url = `https://cdn.jsdelivr.net/gh/${owner}/${name}@${commit.sha}/${filePath}`;
    await updateFeaturedDonor(donorId, { photoUrl: url });
    revalidatePath(`/dashboard/admin/donor-wall/${donorId}`);
    revalidatePath("/dashboard/admin/donor-wall");
    revalidatePath("/donors");
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
