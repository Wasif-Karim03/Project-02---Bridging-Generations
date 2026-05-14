import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { StudentSponsorshipApplicationForm } from "./_components/StudentSponsorshipApplicationForm";

export const metadata: Metadata = {
  title: "Apply for student sponsorship",
  description:
    "Application form for Bridging Generations student sponsorship — covers tuition, books, meals, and the materials that keep a child in school.",
};

export default function ApplyStudentSponsorshipPage() {
  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Students", url: "/students" },
    { name: "Apply for sponsorship", url: "/apply/student-sponsorship" },
  ]);

  return (
    <div className="bg-ground">
      <section
        aria-labelledby="apply-student-title"
        className="scroll-mt-20 bg-ground-3 px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-32 lg:pb-16"
      >
        <div className="mx-auto max-w-[840px]">
          <Reveal stagger="up">
            <Eyebrow>Apply</Eyebrow>
            <h1
              id="apply-student-title"
              className="mt-3 max-w-[28ch] text-balance text-display-2 text-ink"
            >
              Apply to become a sponsored student.
            </h1>
            <p className="mt-4 max-w-[60ch] text-body-lg text-ink-2">
              This is the application a student (or their guardian) fills out to start the
              sponsorship review process. Replaces the previous Google Form.
            </p>
            <p className="mt-3 text-meta uppercase tracking-[0.06em] text-ink-2">
              Read the{" "}
              <Link
                href="/students#rules"
                className="text-accent underline underline-offset-[3px] hover:no-underline"
              >
                scholarship rules
              </Link>{" "}
              first. Applications are reviewed at the start of each term.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        aria-label="Sponsorship application form"
        className="px-4 py-16 sm:px-6 lg:px-[6%] lg:py-20"
      >
        <div className="mx-auto max-w-[840px]">
          <StudentSponsorshipApplicationForm />
        </div>
      </section>

      <CTAFooterPanel
        headline="Already a sponsored student?"
        body="If you're applying for a follow-on scholarship (not the first time), use the scholarship application form."
        ctaLabel="Scholarship application"
        ctaHref="/apply/scholarship"
        tone="cream"
        titleId="apply-student-cta-title"
      />
      <JsonLd id="ld-apply-student-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
