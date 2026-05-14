import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "next-view-transitions";
import { MDXRenderer } from "@/components/content/MDXRenderer";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getScholarshipsPage } from "@/lib/content/scholarshipsPage";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

export const metadata: Metadata = {
  title: "Scholarships",
  description:
    "Bridging Generations' scholarship sub-program — overview, eligibility, what we cover, and how to apply.",
};

export default async function ScholarshipsSubPage() {
  const page = await getScholarshipsPage();
  const overview = page?.overview ? await page.overview() : "";
  const eligibility = page?.eligibility ? await page.eligibility() : "";

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Projects", url: "/projects" },
    { name: "Scholarships", url: "/projects/scholarships" },
  ]);

  return (
    <div className="atmospheric-page">
      <section
        aria-labelledby="scholarships-hero-title"
        className="scroll-mt-20 overflow-x-clip bg-ground-3 px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <Reveal stagger="up">
            <div className="flex flex-col gap-6">
              <Eyebrow>{page?.heroEyebrow ?? "Sub-program"}</Eyebrow>
              <h1
                id="scholarships-hero-title"
                className="max-w-[22ch] text-balance text-display-2 text-ink"
              >
                {page?.heroHeadline ?? "Scholarships."}
              </h1>
              <p className="max-w-[44ch] text-body-lg text-ink-2">
                {page?.heroSubhead ??
                  "Tuition, books, daily meals, and the materials that keep underprivileged students in the classroom."}
              </p>
              {page?.applyCtaHref ? (
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={page.applyCtaHref}
                    className="inline-flex min-h-[48px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
                  >
                    {page.applyCtaLabel || "Apply for a scholarship"}
                  </Link>
                  <Link
                    href="/students"
                    className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    See current students
                  </Link>
                </div>
              ) : null}
            </div>
          </Reveal>
          <Reveal stagger="right" delay={150}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
              <Image
                src="/project-scholarship.jpg"
                alt="A sponsored student at her desk holding her notebook"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {overview ? (
        <section
          id="overview"
          aria-labelledby="overview-title"
          className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
        >
          <div className="mx-auto max-w-[840px]">
            <Eyebrow>Overview</Eyebrow>
            <h2 id="overview-title" className="mt-3 text-balance text-heading-1 text-ink">
              How scholarships work.
            </h2>
            <div className="mt-8">
              <MDXRenderer source={overview} />
            </div>
          </div>
        </section>
      ) : null}

      {eligibility ? (
        <section
          id="eligibility"
          aria-labelledby="eligibility-title"
          className="scroll-mt-20 bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
        >
          <div className="mx-auto max-w-[840px]">
            <Eyebrow>Eligibility</Eyebrow>
            <h2 id="eligibility-title" className="mt-3 text-balance text-heading-1 text-ink">
              Who can apply.
            </h2>
            <div className="mt-8">
              <MDXRenderer source={eligibility} />
            </div>
          </div>
        </section>
      ) : null}

      <CTAFooterPanel
        headline="Apply or sponsor a student."
        body="Whether you're an applicant, a guardian, or a sponsor — the next step is the same: send us a note."
        ctaLabel={page?.applyCtaLabel || "Apply now"}
        ctaHref={page?.applyCtaHref || "/contact"}
        tone="cream"
        titleId="scholarships-cta-title"
      />
      <JsonLd id="ld-scholarships-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
