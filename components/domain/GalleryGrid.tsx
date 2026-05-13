"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { GalleryLightbox } from "@/components/domain/GalleryLightbox";
import { ScaleGrid } from "@/components/ui/editorial";
import type { GalleryImage } from "@/lib/content/galleryImages";

type Span = 12 | 8 | 6 | 4 | 3;

type Group = {
  key: string;
  label: string;
  startIndex: number;
  items: GalleryImage[];
};

function buildGroups(items: readonly GalleryImage[]): Group[] {
  const buckets = new Map<string, GalleryImage[]>();
  for (const item of items) {
    const year = item.takenAt ? new Date(item.takenAt).getFullYear() : null;
    const key = year ? String(year) : "undated";
    const list = buckets.get(key) ?? [];
    list.push(item);
    buckets.set(key, list);
  }
  // Compute start index across the global lightbox sequence so navigation
  // matches the order users see on the page (year desc, undated last).
  const sortedKeys = Array.from(buckets.keys()).sort((a, b) => {
    if (a === "undated") return 1;
    if (b === "undated") return -1;
    return Number(b) - Number(a);
  });
  const groups: Group[] = [];
  let cursor = 0;
  for (const key of sortedKeys) {
    const list = buckets.get(key) ?? [];
    groups.push({
      key,
      label: key === "undated" ? "Undated" : key,
      startIndex: cursor,
      items: list,
    });
    cursor += list.length;
  }
  return groups;
}

// Scale-of-importance rule: first cell of each group spans 8, second spans 4,
// then alternating 6/6 to keep the editorial rhythm. At small group sizes
// (n=1) the singleton spans 12; n=2 splits 8/4; n=3 spans 8/4/12; etc.
function spanFor(indexInGroup: number, groupSize: number): Span {
  if (groupSize === 1) return 12;
  if (groupSize === 2) return indexInGroup === 0 ? 8 : 4;
  if (indexInGroup === 0) return 8;
  if (indexInGroup === 1) return 4;
  return indexInGroup % 2 === 0 ? 6 : 6;
}

type GalleryGridProps = {
  images: readonly GalleryImage[];
};

export function GalleryGrid({ images }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const orderedImages = useMemo(() => {
    const groups = buildGroups(images);
    return groups.flatMap((g) => g.items);
  }, [images]);
  const groups = useMemo(() => buildGroups(images), [images]);

  const handleOpen = useCallback((globalIndex: number) => {
    setLightboxIndex(globalIndex);
  }, []);
  const handleClose = useCallback(() => setLightboxIndex(null), []);
  const handleNavigate = useCallback((index: number) => setLightboxIndex(index), []);

  if (images.length === 0) {
    return <p className="text-body text-ink-2">No photographs yet.</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-16 lg:gap-24">
        {groups.map((group) => (
          <section
            key={group.key}
            aria-labelledby={`gallery-group-${group.key}`}
            className="flex flex-col gap-8 lg:gap-10"
          >
            <header className="flex items-baseline justify-between border-t border-hairline pt-4">
              <h2
                id={`gallery-group-${group.key}`}
                className="text-meta uppercase tracking-[0.16em] text-ink"
              >
                {group.label}
              </h2>
              <span className="text-meta uppercase tracking-[0.08em] text-ink-2">
                {group.items.length} {group.items.length === 1 ? "photograph" : "photographs"}
              </span>
            </header>
            <ScaleGrid>
              {group.items.map((item, indexInGroup) => {
                const globalIndex = group.startIndex + indexInGroup;
                const span = spanFor(indexInGroup, group.items.length);
                const year = item.takenAt ? new Date(item.takenAt).getFullYear() : null;
                return (
                  <ScaleGrid.Cell key={item.id} span={span}>
                    <button
                      type="button"
                      onClick={() => handleOpen(globalIndex)}
                      className="group block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
                      aria-label={`Open ${item.caption} in lightbox`}
                    >
                      <figure className="flex flex-col gap-3">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-ground-3">
                          <Image
                            src={item.image.src ?? ""}
                            alt={item.image.alt || item.caption}
                            fill
                            sizes={
                              span >= 8
                                ? "(min-width: 1024px) 66vw, 100vw"
                                : "(min-width: 1024px) 33vw, 50vw"
                            }
                            priority={globalIndex === 0}
                            fetchPriority={globalIndex === 0 ? "high" : undefined}
                            className="object-cover transition-[filter] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:saturate-[1.04] motion-safe:group-focus-visible:saturate-[1.04] motion-safe:group-active:saturate-[1.04]"
                          />
                        </div>
                        <figcaption className="flex flex-col gap-1">
                          <span className="text-body-sm text-ink">{item.caption}</span>
                          <span className="text-meta uppercase tracking-[0.1em] text-ink-2">
                            {[item.location, year, item.photographerCredit]
                              .filter(Boolean)
                              .join(" · ")}
                          </span>
                        </figcaption>
                      </figure>
                    </button>
                  </ScaleGrid.Cell>
                );
              })}
            </ScaleGrid>
          </section>
        ))}
      </div>
      <GalleryLightbox
        images={orderedImages}
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    </>
  );
}
