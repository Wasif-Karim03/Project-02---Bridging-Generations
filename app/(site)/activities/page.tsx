import type { Metadata } from "next";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllActivitiesPublished } from "@/lib/content/activities";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";
import { ActivitiesHero } from "./_components/ActivitiesHero";
import { ActivityFilter } from "./_components/ActivityFilter";

export const metadata: Metadata = {
  title: "Activities",
  description:
    "Recent field updates from Bridging Generations — distributions, milestones, visits, fundraisers, and announcements from our partner schools.",
};

export default async function ActivitiesPage() {
  const activities = await getAllActivitiesPublished();

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Activities", url: "/activities" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/activities",
    name: "Recent Activities",
  });

  return (
    <>
      <ActivitiesHero count={activities.length} />
      <section
        aria-label="Recent activities"
        className="bg-ground px-4 pb-20 sm:px-6 lg:px-[6%] lg:pb-28"
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10 lg:gap-14">
          <ActivityFilter activities={activities} />
        </div>
      </section>
      <CTAFooterPanel
        headline="Support the next update on this list."
        body="Every activity here is someone's donation at work — a meal served, a scholarship awarded, a delivery made. Start a recurring sponsorship to keep the list going."
        ctaLabel="Donate now"
        ctaHref="/donate"
        tone="cream"
        titleId="activities-cta-title"
      />
      <JsonLd id="ld-activities-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-activities-collection" data={ldCollection} />
    </>
  );
}
