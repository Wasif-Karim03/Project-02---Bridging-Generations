import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { galleryImageCollection } from "@/keystatic/collections/galleryImage";
import { reader } from "./reader";

export type GalleryImage = Entry<typeof galleryImageCollection> & { id: string };

function takenAtRank(entry: GalleryImage): number {
  const raw = entry.takenAt;
  if (!raw) return -Infinity;
  const t = new Date(raw).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const entries = await reader.collections.galleryImage.all();
  return entries
    .map(({ slug, entry }) => ({ ...entry, id: slug }))
    .sort((a, b) => takenAtRank(b) - takenAtRank(a));
}
