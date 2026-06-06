import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getDonationJourney } from "@/lib/content/donationJourney";
import { getPageMedia } from "@/lib/content/pageMedia";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { JourneyHero } from "./_components/JourneyHero";
import { LifetimeImpact } from "./_components/LifetimeImpact";
import { YearTimeline } from "./_components/YearTimeline";

export const metadata: Metadata = {
  title: "Our Donation Journey",
  description:
    "Five years of impact — see how Bridging Generations donors have funded tuition, meals, and materials for students in the Chittagong Hill Tracts.",
  alternates: pageAlternates("/donation-journey"),
};

export default async function DonationJourneyPage() {
  const [journey, pageMedia] = await Promise.all([getDonationJourney(), getPageMedia()]);
  const t = await getTranslations("donationJourney");

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Donation Journey", url: "/donation-journey" },
  ]);

  return (
    <>
      <JourneyHero
        headline={journey.headline}
        intro={journey.intro}
        totalRaisedAllTime={journey.totalRaisedAllTime ?? 0}
        heroImage={pageMedia.donationJourneyHeroImage}
      />
      <YearTimeline entries={journey.yearlyEntries} />
      <LifetimeImpact
        totalRaisedAllTime={journey.totalRaisedAllTime ?? 0}
        totalStudentsAllTime={journey.totalStudentsAllTime ?? 0}
        totalDonorsAllTime={journey.totalDonorsAllTime ?? 0}
      />
      <CTAFooterPanel
        headline={t("ctaHeadline")}
        body={t("ctaBody")}
        ctaLabel={t("ctaLabel")}
        ctaHref="/be-a-donor"
        tone="teal"
        titleId="journey-cta-title"
      />
      <JsonLd id="ld-journey-breadcrumb" data={ldBreadcrumb} />
    </>
  );
}
