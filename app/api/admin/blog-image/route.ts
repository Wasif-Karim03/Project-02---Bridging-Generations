import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { updateBlogPost } from "@/lib/db/queries/blogPosts";
import { commitImageToRepo, extForImage, isRepoImageConfigured } from "@/lib/storage/repoImage";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

// Upload a blog post's cover image (free CDN-backed storage). Admin-only.
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
  const postId = String(form.get("postId") ?? "").trim();
  const file = form.get("file");
  if (!postId || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing post or file." }, { status: 400 });
  }
  const ext = extForImage(file.type);
  if (!ext) {
    return NextResponse.json(
      { error: "Use a JPG, PNG, WebP, GIF or AVIF image." },
      { status: 400 },
    );
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.length === 0) return NextResponse.json({ error: "Empty file." }, { status: 400 });
  if (bytes.length > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 10 MB." }, { status: 400 });
  }

  const safeId = postId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 36);
  const filePath = `public/images/blog/${safeId}/cover-${crypto.randomUUID()}.${ext}`;

  try {
    const url = await commitImageToRepo(filePath, bytes, `blog: cover ${safeId}`);
    await updateBlogPost(postId, { coverUrl: url });
    revalidatePath(`/dashboard/admin/posts/${postId}`);
    revalidatePath("/dashboard/admin/posts");
    revalidatePath("/blog");
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
