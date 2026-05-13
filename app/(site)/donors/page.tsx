import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDonationJourney } from "@/lib/content/donationJourney";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { JourneyHero } from "@/app/(site)/donation-journey/_components/JourneyHero";
import { LifetimeImpact } from "@/app/(site)/donation-journey/_components/LifetimeImpact";
import { YearTimeline } from "@/app/(site)/donation-journey/_components/YearTimeline";

export const metadata: Metadata = {
  title: "Our Donation Journey",
  description:
    "Five years of impact — see how Bridging Generations donors have funded tuition, meals, and materials for students in the Chittagong Hill Tracts.",
};

export default async function DonorsPage() {
  const journey = await getDonationJourney();

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Donors", url: "/donors" },
  ]);

  return (
    <>
      <JourneyHero
        headline={journey.headline}
        intro={journey.intro}
        totalRaisedAllTime={journey.totalRaisedAllTime ?? 0}
      />
      <YearTimeline entries={journey.yearlyEntries} />
      <LifetimeImpact
        totalRaisedAllTime={journey.totalRaisedAllTime ?? 0}
        totalStudentsAllTime={journey.totalStudentsAllTime ?? 0}
        totalDonorsAllTime={journey.totalDonorsAllTime ?? 0}
      />
      <CTAFooterPanel
        headline="Join the journey."
        body="Every gift keeps one more student in school. Start a recurring sponsorship or make a one-time contribution."
        ctaLabel="Create your donor profile"
        ctaHref="/give"
        tone="teal"
        titleId="journey-cta-title"
      />
      <JsonLd id="ld-donors-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
