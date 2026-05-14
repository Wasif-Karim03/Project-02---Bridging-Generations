"use client";

import Image from "next/image";
import { Link } from "next-view-transitions";
import { useMemo, useState } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { GALLERY_CATEGORY_OPTIONS } from "@/keystatic/collections/galleryImage";
import type { GalleryImage } from "@/lib/content/galleryImages";

type HomeGalleryProps = {
  images: GalleryImage[];
};

const TABS = [{ value: "all" as const, label: "All" }, ...GALLERY_CATEGORY_OPTIONS];

// Homepage gallery — filterable tab grid showing up to 8 photos.
// Tabs: All / Humanity / Activities / Projects / Students / Publication.
// Client-side filter (no route change) so motion + transitions stay smooth.
export function HomeGallery({ images }: HomeGalleryProps) {
  const [active, setActive] = useState<string>("all");

  const filtered = useMemo(() => {
    if (active === "all") return images;
    return images.filter((img) => img.category === active);
  }, [active, images]);

  const visible = filtered.slice(0, 8);

  if (images.length === 0) return null;

  return (
    <section
      id="gallery"
      aria-labelledby="home-gallery-title"
      className="scroll-mt-20 bg-ground-2 py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <Reveal stagger="up">
          <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-3">
              <Eyebrow>From the field</Eyebrow>
              <h2 id="home-gallery-title" className="text-balance text-heading-2 text-ink">
                Gallery
              </h2>
            </div>
            <Link
              href="/gallery"
              className="group inline-flex min-h-[44px] items-center gap-1 py-2 text-nav-link uppercase text-accent transition hover:text-accent-2-text"
            >
              See full gallery
              <span
                aria-hidden="true"
                className="transition-transform motion-safe:group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </header>
        </Reveal>

        <div
          role="tablist"
          aria-label="Filter gallery"
          className="mb-8 flex flex-wrap gap-2 lg:mb-10"
        >
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
              </button>
            );
          })}
        </div>

        {visible.length === 0 ? (
          <p className="text-body-sm text-ink-2">No photographs in this category yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
            {visible.map((img) => (
              <li key={img.id} className="relative aspect-[4/3] overflow-hidden bg-ground-3">
                <Image
                  src={img.image.src ?? ""}
                  alt={img.image.alt || img.caption}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.04]"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
