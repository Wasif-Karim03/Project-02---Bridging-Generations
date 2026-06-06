import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllGalleryImages } from "@/lib/content/galleryImages";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { FilterableGallery } from "./_components/FilterableGallery";
import { GalleryHero } from "./_components/GalleryHero";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photographs from partner schools, program visits, and the students sponsored by Bridging Generations across the Chittagong Hill Tracts.",
  alternates: pageAlternates("/gallery"),
};

export default async function GalleryPage() {
  const items = await getAllGalleryImages();
  const t = await getTranslations("gallery");

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Gallery", url: "/gallery" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/gallery",
    name: "Gallery",
    description: "Photographs from partner schools and field visits in the Chittagong Hill Tracts.",
  });

  return (
    <>
      <GalleryHero count={items.length} />
      <section
        aria-label="Photograph grid"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <FilterableGallery images={items} />
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
      <JsonLd id="ld-gallery-collection" data={ldCollection} />
    </>
  );
}
