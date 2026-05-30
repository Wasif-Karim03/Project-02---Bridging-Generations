import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

export const metadata: Metadata = {
  title: "Apply for a scholarship",
  description:
    "Bridging Generations scholarship application — for current students at our partner schools in the Chittagong Hill Tracts. Submissions reviewed within 4 weeks.",
  alternates: pageAlternates("/apply/scholarship"),
};

export default async function ApplyScholarshipPage() {
  const t = await getTranslations("applyPages");
  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Scholarships", url: "/projects/scholarships" },
    { name: "Apply", url: "/apply/scholarship" },
  ]);

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="apply-hero-title"
        className="scroll-mt-20 bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[840px]">
          <Reveal stagger="up">
            <Eyebrow>Apply</Eyebrow>
            <h1
              id="apply-hero-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              {t("scholarshipHeroHeadline")}
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">{t("scholarshipHeroBody")}</p>
            <p className="mt-3 text-meta uppercase tracking-[0.06em] text-ink-2">
              {t("scholarshipRulesIntroBefore")}{" "}
              <Link
                href="/students#rules"
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                {t("scholarshipRulesLinkLabel")}
              </Link>{" "}
              {t("scholarshipRulesIntroAfter")}
            </p>
          </Reveal>
        </div>
      </section>

      <section
        aria-labelledby="apply-cta-section"
        className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto flex max-w-[840px] flex-col gap-6">
          <h2 id="apply-cta-section" className="text-heading-3 text-ink">
            Start your application.
          </h2>
          <p className="max-w-[60ch] text-body text-ink-2">
            We've moved the form behind a free student account so you can track your application,
            see decisions, and (once approved) view the sponsors who give toward your education. The
            two-step flow takes about 10 minutes:
          </p>
          <ol className="ml-6 list-decimal text-body text-ink marker:text-accent">
            <li className="mb-2">
              Create your account (email + password — same as you'd sign up for any service).
            </li>
            <li className="mb-2">
              Fill out the application form with your details, your family situation, and what
              you're hoping to achieve.
            </li>
            <li>
              The board reviews and replies within four weeks. Once approved you can sign in at any
              time to see your dashboard.
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/student-signup"
              className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
            >
              Create my account →
            </Link>
            <Link
              href="/student-login"
              className="inline-flex min-h-[48px] items-center border border-accent px-6 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
            >
              I already have one — sign in
            </Link>
          </div>
        </div>
      </section>

      <CTAFooterPanel
        headline={t("scholarshipCtaHeadline")}
        body={t("scholarshipCtaBody")}
        ctaLabel={t("scholarshipCtaLabel")}
        ctaHref="/be-a-donor"
        tone="cream"
        titleId="apply-cta-title"
      />
      <JsonLd id="ld-apply-scholarship-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
