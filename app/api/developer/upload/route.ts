import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/developer/session";
import { persistChanges } from "@/lib/developer/storage";

export const runtime = "nodejs";

// Cap uploads so a stray large file can't blow past GitHub's blob limits or
// bloat the repo. 8MB is generous for web imagery.
const MAX_BYTES = 8 * 1024 * 1024;

function sanitizeDir(dir: string): string | null {
  return /^[a-z0-9-]+$/.test(dir) ? dir : null;
}

function sanitizeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = (dot >= 0 ? name.slice(dot + 1) : "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const stem = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const suffix = Date.now().toString(36);
  return `${stem || "image"}-${suffix}.${ext || "jpg"}`;
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const dirRaw = String(form.get("dir") ?? "");
  const dir = sanitizeDir(dirRaw);
  if (!dir) return NextResponse.json({ error: "Invalid image directory." }, { status: 400 });
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8MB." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = sanitizeName(file.name || "image.jpg");
  const repoPath = `public/images/${dir}/${filename}`;
  const src = `/images/${dir}/${filename}`;

  try {
    const mode = await persistChanges(
      [{ path: repoPath, content: bytes, binary: true }],
      `content: upload image ${src} (via editor)`,
    );
    return NextResponse.json({ ok: true, src, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
