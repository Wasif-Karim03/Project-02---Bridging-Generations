import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { MentorApplicationForm } from "./_components/MentorApplicationForm";

export const metadata: Metadata = {
  title: "Apply as a mentor",
  description:
    "Apply to mentor or teach online for Bridging Generations students. We pair every active student with a volunteer mentor.",
};

export default function ApplyMentorPage() {
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
              Mentor a Bridging Generations student.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              One hour a week, real impact. The board reviews every applicant — subject fit and
              references — within three weeks. Once approved, you're matched with one or more
              students for at least one term.
            </p>
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
        headline="Not a mentor — but want to help?"
        body="Sponsor a student or back a project. Every $30/month keeps a child in the classroom."
        ctaLabel="See how to sponsor"
        ctaHref="/donate"
        tone="cream"
        titleId="apply-mentor-cta-title"
      />
      <JsonLd id="ld-apply-mentor-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
