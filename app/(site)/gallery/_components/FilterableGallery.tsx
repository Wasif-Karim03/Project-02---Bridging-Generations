"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GalleryGrid } from "@/components/domain/GalleryGrid";
import { GALLERY_CATEGORY_OPTIONS } from "@/keystatic/collections/galleryImage";
import type { GalleryImage } from "@/lib/content/galleryImages";

type FilterableGalleryProps = {
  images: GalleryImage[];
};

const CATEGORY_VALUES = ["all", ...GALLERY_CATEGORY_OPTIONS.map((o) => o.value)] as const;

export function FilterableGallery({ images }: FilterableGalleryProps) {
  const t = useTranslations("gallery");
  const locale = useLocale();
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);

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

  const tabLabel: Record<string, string> = {
    all: t("filterAll"),
    humanity: t("filterHumanity"),
    activities: t("filterActivities"),
    projects: t("filterProjects"),
    students: t("filterStudents"),
    publication: t("filterPublication"),
  };

  return (
    <div className="flex flex-col gap-10">
      <div role="tablist" aria-label="Filter gallery by category" className="flex flex-wrap gap-2">
        {CATEGORY_VALUES.map((value) => {
          const isActive = active === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(value)}
              className={
                isActive
                  ? "inline-flex min-h-[36px] items-center bg-accent px-4 text-meta uppercase tracking-[0.08em] text-white transition-colors"
                  : "inline-flex min-h-[36px] items-center border border-hairline bg-ground-2 px-4 text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
              }
            >
              {tabLabel[value]}
              <span className="ml-2 opacity-70">({fmt.format(counts[value] ?? 0)})</span>
            </button>
          );
        })}
      </div>
      <GalleryGrid images={filtered} />
    </div>
  );
}
