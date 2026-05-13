import type { Metadata } from "next";
import Image from "next/image";
import { Dropcap } from "@/components/content/Dropcap";
import { SceneBreak } from "@/components/content/SceneBreak";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getSiteSettings } from "@/lib/content/siteSettings";
import { breadcrumbList } from "@/lib/seo/jsonLd";
import { SITE_URL } from "@/lib/seo/siteUrl";

export const metadata: Metadata = {
  title: "Our Mission and Our Vision",
  description:
    "The mission and vision of Bridging Generations — establishing an enlightened generation and providing scholarships to underprivileged but talented students.",
};

export default async function MissionVisionPage() {
  const siteSettings = await getSiteSettings();

  const ldBreadcrumb = breadcrumbList(SITE_URL, [
    { name: "Home", url: "/" },
    { name: "About BG", url: "/about" },
    { name: "Mission & Vision", url: "/mission-vision" },
  ]);

  return (
    <div className="atmospheric-page">
      <section
        id="mission-vision-hero"
        aria-labelledby="mission-vision-title"
        className="scroll-mt-20 overflow-x-clip bg-ground-3 px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
      >
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] lg:gap-16">
          <Reveal stagger="up">
            <div className="flex flex-col gap-6">
              <Eyebrow>Our Mission and Our Vision</Eyebrow>
              <h1
                id="mission-vision-title"
                className="max-w-[22ch] text-balance text-display-2 text-ink"
              >
                Education without the barrier of poverty.
              </h1>
              <p className="max-w-[44ch] text-body-lg text-ink-2">
                Two statements that anchor everything we do — what we promise our students today,
                and the generation we are working toward tomorrow.
              </p>
            </div>
          </Reveal>
          <Reveal stagger="right" delay={150}>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-ground-2">
              <Image
                src="/home-mission.jpg"
                alt="A schoolboy in uniform sits in a library corner reading a book"
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
        id="mission"
        aria-labelledby="mission-title"
        className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto max-w-[840px] flex flex-col gap-6">
          <SceneBreak />
          <Eyebrow>Mission</Eyebrow>
          <h2 id="mission-title" className="text-balance text-heading-1 text-ink">
            Our Mission
          </h2>
          <Dropcap>
            <p className="text-body-lg text-ink-2">{siteSettings.missionFull}</p>
          </Dropcap>
        </div>
      </section>

      <section
        id="vision"
        aria-labelledby="vision-title"
        className="scroll-mt-20 bg-ground-3 px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
      >
        <div className="mx-auto max-w-[840px] flex flex-col gap-6">
          <SceneBreak />
          <Eyebrow>Vision</Eyebrow>
          <h2 id="vision-title" className="text-balance text-heading-1 text-ink">
            Our Vision
          </h2>
          <Dropcap>
            <p className="text-body-lg text-ink-2">{siteSettings.visionFull}</p>
          </Dropcap>
        </div>
      </section>

      <CTAFooterPanel
        headline="Stand with the next generation."
        body="Every sponsorship keeps one more student in the classroom. Help us carry this work forward."
        ctaLabel="Donate"
        ctaHref="/donate-us"
        tone="cream"
        titleId="mission-vision-cta-title"
        id="join"
      />
      <JsonLd id="ld-mission-vision-breadcrumb" data={ldBreadcrumb} />
    </div>
  );
}
