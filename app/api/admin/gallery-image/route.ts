import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { addGalleryImage } from "@/lib/db/queries/gallery";
import { isGalleryTag } from "@/lib/gallery/tags";
import { commitImageToRepo, extForImage, isRepoImageConfigured } from "@/lib/storage/repoImage";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

// Upload a gallery image with a tag (free CDN storage). Admin-only.
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
  const file = form.get("file");
  const tagRaw = String(form.get("tag") ?? "Activities");
  const tag = isGalleryTag(tagRaw) ? tagRaw : "Activities";
  const caption = String(form.get("caption") ?? "").trim();
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
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

  const filePath = `public/images/gallery/${crypto.randomUUID()}.${ext}`;
  try {
    const url = await commitImageToRepo(filePath, bytes, `gallery: ${tag} image`);
    await addGalleryImage({ url, tag, caption: caption || null });
    revalidatePath("/dashboard/admin/gallery");
    revalidatePath("/gallery");
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed." },
      { status: 500 },
    );
  }
}
