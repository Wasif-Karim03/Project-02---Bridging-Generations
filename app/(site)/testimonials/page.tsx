import type { Metadata } from "next";
import { Suspense } from "react";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { TestimonialsGrid } from "./_components/TestimonialsGrid";
import { TestimonialsHero } from "./_components/TestimonialsHero";

export const metadata: Metadata = {
  title: "Testimonials",
  description:
    "Quotes from parents, teachers, students, alumni, partners, and donors about Bridging Generations' work in the Chittagong Hill Tracts.",
};

const ROLE_VALUES = [
  "parent",
  "teacher",
  "student",
  "alum",
  "board",
  "partner",
  "volunteer",
  "donor",
] as const;

export default async function TestimonialsPage() {
  const testimonials = await getAllTestimonials();

  const roleCounts: Record<string, number> = { all: testimonials.length };
  for (const role of ROLE_VALUES) roleCounts[role] = 0;
  for (const t of testimonials) {
    roleCounts[t.speakerRole] = (roleCounts[t.speakerRole] ?? 0) + 1;
  }

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Testimonials", url: "/testimonials" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/testimonials",
    name: "Testimonials",
    description: "A filterable wall of testimonials from Bridging Generations' extended community.",
  });

  return (
    <>
      <TestimonialsHero count={testimonials.length} roleCounts={roleCounts} />
      <section
        aria-label="Testimonials by role"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <Suspense fallback={<div className="h-32" />}>
            <TestimonialsGrid testimonials={testimonials} roleCounts={roleCounts} />
          </Suspense>
        </div>
      </section>
      <CTAFooterPanel
        headline="Add yours."
        body="Know a parent, teacher, or alum whose story belongs here? Point them our way — we publish with permission."
        ctaLabel="Contact us"
        ctaHref="/contact"
        tone="cream"
        titleId="testimonials-cta-title"
      />
      <JsonLd id="ld-testimonials-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-testimonials-collection" data={ldCollection} />
    </>
  );
}
