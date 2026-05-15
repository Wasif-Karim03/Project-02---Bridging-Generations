import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { Reveal } from "@/components/ui/Reveal";

export function HomeCTAFooter() {
  return (
    <Reveal stagger="up">
      <CTAFooterPanel
        headline="Join us. Sponsor a child — or apply for a scholarship."
        body="$30 a month covers tuition, books, daily meals, and materials for one student. Students in the Hill Tracts can apply for a scholarship in under 10 minutes."
        ctaLabel="Be a Donor"
        ctaHref="/be-a-donor"
        secondaryCtaLabel="Apply as a student"
        secondaryCtaHref="/student-signup"
        tone="cream"
        titleId="home-cta-footer-title"
        id="join"
      />
    </Reveal>
  );
}
