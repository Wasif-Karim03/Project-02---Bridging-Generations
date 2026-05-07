import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { blogPostCollection } from "@/keystatic/collections/blogPost";
import { reader } from "./reader";

export type BlogPost = Entry<typeof blogPostCollection> & { slug: string };

function isPublishedNow(post: BlogPost, now = new Date()): boolean {
  if (!post.published) return false;
  if (!post.publishedAt) return false;
  return new Date(post.publishedAt).getTime() <= now.getTime();
}

export function filterPublishedPosts(posts: BlogPost[], now = new Date()): BlogPost[] {
  return posts
    .filter((p) => isPublishedNow(p, now))
    .sort((a, b) => {
      const aDate = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bDate = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bDate - aDate;
    });
}

export async function getAllBlogPostsRaw(): Promise<BlogPost[]> {
  const entries = await reader.collections.blogPost.all();
  return entries.map(({ slug, entry }) => ({ ...entry, slug }));
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return filterPublishedPosts(await getAllBlogPostsRaw());
}

export async function getFeaturedBlogPost(): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find((p) => p.featured) ?? posts[0] ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const entry = await reader.collections.blogPost.read(slug);
  if (!entry) return null;
  const post = { ...entry, slug } as BlogPost;
  return isPublishedNow(post) ? post : null;
}

type RecentArgs = {
  exclude?: string;
  limit?: number;
};

export async function getRecentBlogPosts({
  exclude,
  limit = 3,
}: RecentArgs = {}): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.filter((p) => p.slug !== exclude).slice(0, limit);
}
