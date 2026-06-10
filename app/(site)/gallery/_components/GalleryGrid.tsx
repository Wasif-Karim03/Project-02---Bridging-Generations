"use client";

import { useState } from "react";
import { GALLERY_TAGS, type GalleryTag } from "@/lib/gallery/tags";

type Item = { url: string; caption: string | null; tag: GalleryTag };

export function GalleryGrid({ items }: { items: Item[] }) {
  const [active, setActive] = useState<"All" | GalleryTag>("All");

  const counts: Record<string, number> = { All: items.length };
  for (const t of GALLERY_TAGS) counts[t] = items.filter((i) => i.tag === t).length;

  const shown = active === "All" ? items : items.filter((i) => i.tag === active);
  const chips: ("All" | GalleryTag)[] = ["All", ...GALLERY_TAGS];

  return (
    <div className="flex flex-col gap-8">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => {
          const on = active === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 text-nav-link uppercase tracking-[0.04em] transition-colors ${
                on
                  ? "border-accent bg-accent text-white"
                  : "border-hairline text-ink-2 hover:border-accent hover:text-accent"
              }`}
            >
              {c}
              <span className={on ? "text-white/70" : "text-ink-2/70"}>({counts[c]})</span>
            </button>
          );
        })}
      </div>

      {/* Masonry grid */}
      {shown.length === 0 ? (
        <p className="text-body text-ink-2">No photos in this category yet.</p>
      ) : (
        <div className="gap-4 [column-fill:_balance] sm:columns-2 md:columns-3 lg:columns-4">
          {shown.map((img) => (
            <figure
              key={img.url}
              className="mb-4 break-inside-avoid overflow-hidden rounded-xl border border-hairline"
            >
              {/* biome-ignore lint/performance/noImgElement: CDN-hosted gallery URL */}
              <img src={img.url} alt={img.caption ?? ""} loading="lazy" className="w-full" />
              {img.caption ? (
                <figcaption className="bg-ground-2 px-3 py-2 text-meta text-ink-2">
                  {img.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
