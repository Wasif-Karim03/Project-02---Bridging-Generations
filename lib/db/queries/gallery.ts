import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { GalleryImage } from "@/db/schema";
import { blogPosts, galleryImages, projectImages, projects } from "@/db/schema";
import type { GalleryTag } from "@/lib/gallery/tags";

export type GalleryItem = { url: string; caption: string | null; tag: GalleryTag };

// Admin view: only the dedicated gallery uploads (these are deletable).
export async function listDedicatedGalleryImages(): Promise<GalleryImage[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(galleryImages)
    .orderBy(desc(galleryImages.sortOrder), desc(galleryImages.createdAt));
}

// Public view: dedicated uploads + published project covers/photos (tag
// "Projects") + published blog covers (tag "Publication"), deduped by URL.
export async function listGalleryItems(): Promise<GalleryItem[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const [dedicated, projCovers, projImgs, blogCovers] = await Promise.all([
    db
      .select({ url: galleryImages.url, caption: galleryImages.caption, tag: galleryImages.tag })
      .from(galleryImages)
      .orderBy(desc(galleryImages.createdAt)),
    db.select({ url: projects.coverUrl }).from(projects).where(eq(projects.published, true)),
    db
      .select({ url: projectImages.url })
      .from(projectImages)
      .innerJoin(projects, eq(projectImages.projectId, projects.id))
      .where(eq(projects.published, true)),
    db.select({ url: blogPosts.coverUrl }).from(blogPosts).where(eq(blogPosts.published, true)),
  ]);

  const items: GalleryItem[] = [];
  const seen = new Set<string>();
  const add = (url: string | null, tag: GalleryTag, caption: string | null = null) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    items.push({ url, caption, tag });
  };

  for (const d of dedicated) add(d.url, (d.tag as GalleryTag) ?? "Activities", d.caption);
  for (const p of projCovers) add(p.url, "Projects");
  for (const p of projImgs) add(p.url, "Projects");
  for (const b of blogCovers) add(b.url, "Publication");

  return items;
}

export async function addGalleryImage(input: {
  url: string;
  tag: GalleryTag;
  caption?: string | null;
}): Promise<void> {
  const db = getDb();
  await db.insert(galleryImages).values({
    url: input.url,
    tag: input.tag,
    caption: input.caption || null,
  });
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const db = getDb();
  await db.delete(galleryImages).where(eq(galleryImages.id, id));
}
