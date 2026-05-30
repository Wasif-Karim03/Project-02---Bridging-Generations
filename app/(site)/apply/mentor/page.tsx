import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { MentorApplicationForm } from "./_components/MentorApplicationForm";

export const metadata: Metadata = {
  title: "Apply as a mentor",
  description:
    "Apply to mentor or teach online for Bridging Generations students. We pair every active student with a volunteer mentor.",
  alternates: pageAlternates("/apply/mentor"),
};

export default async function ApplyMentorPage() {
  const t = await getTranslations("applyPages");
  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Mentors", url: "/mentors" },
    { name: "Apply", url: "/apply/mentor" },
  ]);

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="apply-mentor-title"
        className="scroll-mt-20 bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[840px]">
          <Reveal stagger="up">
            <Eyebrow>Apply</Eyebrow>
            <h1
              id="apply-mentor-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              {t("mentorHeroHeadline")}
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">{t("mentorHeroBody")}</p>
          </Reveal>
        </div>
      </section>

      <section
        aria-label="Mentor application form"
        className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto max-w-[840px]">
          <MentorApplicationForm />
        </div>
      </section>

      <CTAFooterPanel
        headline={t("mentorCtaHeadline")}
        body={t("mentorCtaBody")}
        ctaLabel={t("mentorCtaLabel")}
        ctaHref="/donate"
        tone="cream"
        titleId="apply-mentor-cta-title"
      />
      <JsonLd id="ld-apply-mentor-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
