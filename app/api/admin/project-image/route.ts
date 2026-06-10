import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { addProjectImage, updateProject } from "@/lib/db/queries/projects";
import { commitImageToRepo, extForImage, isRepoImageConfigured } from "@/lib/storage/repoImage";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

// Upload a project image (free CDN-backed storage). `kind=cover` sets the
// project's cover; `kind=gallery` appends to the gallery. Admin-only.
export async function POST(request: Request) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  if (!isRepoImageConfigured()) {
    return NextResponse.json(
      { error: "Image uploads aren't configured (DEVELOPER_GITHUB_TOKEN missing)." },
      { status: 500 },
    );
  }

  const form = await request.formData();
  const projectId = String(form.get("projectId") ?? "").trim();
  const kind = String(form.get("kind") ?? "gallery");
  const caption = String(form.get("caption") ?? "").trim();
  const file = form.get("file");
  if (!projectId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing project or file." }, { status: 400 });
  }
  const ext = extForImage(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF or AVIF image." }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) return NextResponse.json({ error: "Empty file." }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
  }

  const safeId = projectId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
  const filePath = `public/images/projects/${safeId}/${kind}-${crypto.randomUUID()}.${ext}`;

  try {
    const url = await commitImageToRepo(filePath, bytes, `project: ${kind} image ${safeId}`);
    if (kind === "cover") {
      await updateProject(projectId, { coverUrl: url });
    } else {
      await addProjectImage({ projectId, url, caption: caption || null });
    }
    revalidatePath(`/dashboard/admin/projects/${projectId}`);
    revalidatePath("/dashboard/admin/projects");
    revalidatePath("/projects");
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
