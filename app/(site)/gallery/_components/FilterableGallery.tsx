"use client";

import { useMemo, useState } from "react";
import { GalleryGrid } from "@/components/domain/GalleryGrid";
import { GALLERY_CATEGORY_OPTIONS } from "@/keystatic/collections/galleryImage";
import type { GalleryImage } from "@/lib/content/galleryImages";

type FilterableGalleryProps = {
  images: GalleryImage[];
};

const TABS = [{ value: "all" as const, label: "All" }, ...GALLERY_CATEGORY_OPTIONS];

// Wraps GalleryGrid with category filter chips. Year-grouping (already
// handled by GalleryGrid) operates on the post-filter set, so picking a
// category collapses the year archive to just that category.
export function FilterableGallery({ images }: FilterableGalleryProps) {
  const [active, setActive] = useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: images.length };
    for (const tab of GALLERY_CATEGORY_OPTIONS) {
      c[tab.value] = images.filter((img) => img.category === tab.value).length;
    }
    return c;
  }, [images]);

  const filtered = useMemo(() => {
    if (active === "all") return images;
    return images.filter((img) => img.category === active);
  }, [active, images]);

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.value)}
              className={
                isActive
                  ? "inline-flex min-h-[36px] items-center bg-accent px-4 text-meta uppercase tracking-[0.08em] text-white transition-colors"
                  : "inline-flex min-h-[36px] items-center border border-hairline bg-ground-2 px-4 text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
              }
            >
              {tab.label}
              <span className="ml-2 opacity-70">({counts[tab.value] ?? 0})</span>
            </button>
          );
        })}
      </div>
      <GalleryGrid images={filtered} />
    </div>
  );
}
