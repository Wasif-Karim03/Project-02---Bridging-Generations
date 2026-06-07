import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { BoardMemberCard } from "@/components/domain/BoardMemberCard";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getTeamMembersByGroup } from "@/lib/content/boardMembers";
import { getPageMedia } from "@/lib/content/pageMedia";
import { pageAlternates } from "@/lib/seo/alternates";
import { breadcrumbList, collectionPage } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

export const metadata: Metadata = {
  title: "Mentors",
  description:
    "Meet the volunteer mentors and online teachers guiding Bridging Generations students through their studies.",
  alternates: pageAlternates("/mentors"),
};

export default async function MentorsPage() {
  const t = await getTranslations("mentorsPage");
  const [mentors, pageMedia] = await Promise.all([getTeamMembersByGroup("mentor"), getPageMedia()]);

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "Mentors", url: "/mentors" },
  ]);
  const ldCollection = collectionPage({
    siteUrl: SITE_URL,
    url: "/mentors",
    name: "Mentors",
    description: "Volunteer mentors and online teachers at Bridging Generations.",
  });

  return (
    <div className="atmospheric-page">
      <section
        aria-labelledby="mentors-hero-title"
        className="scroll-mt-20 overflow-x-clip bg-ground-3 px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <Reveal stagger="up">
            <div className="flex flex-col gap-6">
              <Eyebrow>{t("heroEyebrow")}</Eyebrow>
              <h1
                id="mentors-hero-title"
                className="max-w-[22ch] text-balance text-display-2 text-ink"
              >
                {t("heroHeadline")}
              </h1>
              <p className="max-w-[44ch] text-body-lg text-ink-2">{t("heroBody")}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/mentor-signup"
                  className="inline-flex min-h-[48px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
                >
                  {t("applyCta")}
                </Link>
                <Link
                  href="/about#team-mentor"
                  className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
                >
                  {t("meetTeamCta")}
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal stagger="right" delay={150}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
              <Image
                src={pageMedia.mentorsHeroImage || "/activity-visit.jpg"}
                alt="A mentor sitting with a student at a school visit"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section
        id="mentors-list"
        aria-labelledby="mentors-list-title"
        className="bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto max-w-[1280px]">
          <header className="flex flex-col gap-3 border-t border-hairline pt-8">
            <Eyebrow>{t("listEyebrow")}</Eyebrow>
            <h2
              id="mentors-list-title"
              className="max-w-[36ch] text-balance text-heading-2 text-ink"
            >
              {t("listHeading")}
            </h2>
            <p className="max-w-[60ch] text-body text-ink-2">{t("listHelper")}</p>
          </header>

          {mentors.length === 0 ? (
            <p className="mt-10 text-body text-ink-2">{t("emptyState")}</p>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {mentors.map((mentor) => (
                <li key={mentor.id}>
                  <BoardMemberCard member={mentor} variant="mentor" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section
        aria-label="How mentoring works"
        className="bg-ground-2 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto max-w-[840px]">
          <Eyebrow>{t("howEyebrow")}</Eyebrow>
          <h2 className="mt-3 text-balance text-heading-1 text-ink">{t("howHeading")}</h2>
          <ol className="mt-8 flex flex-col gap-6 text-body text-ink-2">
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center bg-accent text-meta uppercase text-white">
                1
              </span>
              <div>
                <p className="text-heading-5 text-ink">{t("step1Title")}</p>
                <p>{t("step1Body")}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center bg-accent text-meta uppercase text-white">
                2
              </span>
              <div>
                <p className="text-heading-5 text-ink">{t("step2Title")}</p>
                <p>{t("step2Body")}</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center bg-accent text-meta uppercase text-white">
                3
              </span>
              <div>
                <p className="text-heading-5 text-ink">{t("step3Title")}</p>
                <p>{t("step3Body")}</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <CTAFooterPanel
        headline={t("ctaHeadline")}
        body={t("ctaBody")}
        ctaLabel={t("ctaLabel")}
        ctaHref="/mentor-signup"
        tone="cream"
        titleId="mentors-cta-title"
      />
      <JsonLd id="ld-mentors-breadcrumb" data={ldBreadcrumb} />
      <JsonLd id="ld-mentors-collection" data={ldCollection} />
    </div>
  );
}
