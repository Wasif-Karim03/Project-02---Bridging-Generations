// Gallery photo tags, used both for admin upload and the public filter.
// Project images auto-tag as "Projects"; blog covers as "Publication".

export const GALLERY_TAGS = [
  "Humanity",
  "Activities",
  "Projects",
  "Students",
  "Publication",
] as const;

export type GalleryTag = (typeof GALLERY_TAGS)[number];

export function isGalleryTag(value: string): value is GalleryTag {
  return (GALLERY_TAGS as readonly string[]).includes(value);
}
