import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/developer/session";
import { persistChanges } from "@/lib/developer/storage";

export const runtime = "nodejs";

// Deletes an uploaded image file from the repo (media library "delete").
// Only paths under /images/<dir>/<file> are allowed — no traversal, no
// touching anything outside the uploads tree.
const SRC_RE = /^\/images\/[a-z0-9-]+\/[A-Za-z0-9._-]+$/;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let payload: { src?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const src = payload.src ?? "";
  if (!SRC_RE.test(src)) {
    return NextResponse.json({ error: "Invalid image path." }, { status: 400 });
  }

  try {
    const mode = await persistChanges(
      [{ path: `public${src}`, remove: true }],
      `content: delete image ${src} (via editor)`,
    );
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 },
    );
  }
}
