import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { BlogPost, BlogPostLink } from "@/db/schema";
import { blogPostLinks, blogPosts } from "@/db/schema";
import { slugifyProject } from "@/lib/projects/format";

export type BlogPostFull = BlogPost & { links: BlogPostLink[] };

export async function listBlogPosts(opts: { publishedOnly?: boolean } = {}): Promise<BlogPost[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const base = db.select().from(blogPosts);
  return (
    opts.publishedOnly ? base.where(eq(blogPosts.published, true)) : base
  ).orderBy(asc(blogPosts.displayOrder), desc(blogPosts.createdAt));
}

async function attach(post: BlogPost): Promise<BlogPostFull> {
  const db = getDb();
  const links = await db
    .select()
    .from(blogPostLinks)
    .where(eq(blogPostLinks.postId, post.id))
    .orderBy(asc(blogPostLinks.sortOrder), asc(blogPostLinks.createdAt));
  return { ...post, links };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostFull | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return rows[0] ? attach(rows[0]) : null;
}

export async function getBlogPostById(id: string): Promise<BlogPostFull | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1);
  return rows[0] ? attach(rows[0]) : null;
}

async function uniqueSlug(title: string): Promise<string> {
  const db = getDb();
  const base = slugifyProject(title);
  const taken = new Set(
    (await db.select({ slug: blogPosts.slug }).from(blogPosts)).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    if (!taken.has(`${base}-${i}`)) return `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createBlogPost(title: string): Promise<BlogPost> {
  const db = getDb();
  const slug = await uniqueSlug(title);
  const [row] = await db.insert(blogPosts).values({ slug, title }).returning();
  return row;
}

export async function updateBlogPost(
  id: string,
  patch: Partial<Pick<BlogPost, "title" | "coverUrl" | "body" | "displayOrder" | "published">>,
): Promise<void> {
  const db = getDb();
  await db
    .update(blogPosts)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: string): Promise<void> {
  const db = getDb();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

export async function addBlogPostLink(input: {
  postId: string;
  label: string;
  url: string;
  sortOrder?: number;
}): Promise<void> {
  const db = getDb();
  await db.insert(blogPostLinks).values({
    postId: input.postId,
    label: input.label,
    url: input.url,
    sortOrder: input.sortOrder ?? 0,
  });
}

export async function deleteBlogPostLink(id: string): Promise<void> {
  const db = getDb();
  await db.delete(blogPostLinks).where(eq(blogPostLinks.id, id));
}
