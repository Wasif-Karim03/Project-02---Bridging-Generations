import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { listGalleryItems } from "@/lib/db/queries/gallery";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { GalleryGrid } from "./_components/GalleryGrid";
import { GalleryHero } from "./_components/GalleryHero";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from partner schools, program visits, and the students sponsored by Bridging Generations across the Chittagong Hill Tracts.",
  alternates: pageAlternates("/gallery"),
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await listGalleryItems();
  const t = await getTranslations("gallery");

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Gallery", url: "/gallery" },
  ]);

  return (
    <>
      <GalleryHero count={items.length} />
      <section
        aria-label="Photograph grid"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <div className="mx-auto max-w-[1280px]">
          {items.length === 0 ? (
            <p className="text-body text-ink-2">No photos yet — check back soon.</p>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </section>
      <CTAFooterPanel
        headline={t("ctaHeadline")}
        body={t("ctaBody")}
        ctaLabel={t("ctaLabel")}
        ctaHref="/donate"
        tone="cream"
        titleId="gallery-cta-title"
      />
      <JsonLd id="ld-gallery-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
