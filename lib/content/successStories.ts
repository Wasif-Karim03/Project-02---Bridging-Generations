import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { successStoryCollection } from "@/keystatic/collections/successStory";
import { reader } from "./reader";

export type SuccessStory = Entry<typeof successStoryCollection> & { slug: string };

export async function getAllSuccessStories(): Promise<SuccessStory[]> {
  const entries = await reader.collections.successStory.all();
  return entries.map(({ slug, entry }) => ({ ...entry, slug }));
}

function isPublishedNow(story: SuccessStory, now = new Date()): boolean {
  if (!story.published) return false;
  if (!story.publishedAt) return false;
  return new Date(story.publishedAt).getTime() <= now.getTime();
}

export function filterPublishedSuccessStories(
  stories: SuccessStory[],
  now = new Date(),
): SuccessStory[] {
  return stories
    .filter((s) => isPublishedNow(s, now))
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
}

export async function getAllSuccessStoriesPublished(): Promise<SuccessStory[]> {
  return filterPublishedSuccessStories(await getAllSuccessStories());
}

export async function getFeaturedSuccessStory(): Promise<SuccessStory | undefined> {
  const published = await getAllSuccessStoriesPublished();
  return published[0];
}

export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  const entry = await reader.collections.successStory.read(slug);
  if (!entry) return null;
  const story = { ...entry, slug } as SuccessStory;
  return isPublishedNow(story) ? story : null;
}

type RelatedArgs = {
  exclude?: string;
  limit?: number;
};

export async function getRelatedSuccessStories({
  exclude,
  limit = 2,
}: RelatedArgs = {}): Promise<SuccessStory[]> {
  const published = await getAllSuccessStoriesPublished();
  return published.filter((s) => s.slug !== exclude).slice(0, limit);
}
