import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { StudentSpotlightScroller } from "@/components/domain/StudentSpotlightScroller";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { Student } from "@/lib/content/students";

type HomeSpotlightScrollerProps = {
  students: Student[];
};

export async function HomeSpotlightScroller({ students }: HomeSpotlightScrollerProps) {
  const t = await getTranslations("homeExtra");
  return (
    <section
      id="spotlight"
      aria-labelledby="home-spotlight-title"
      className="scroll-mt-20 bg-ground py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <header className="mb-12 flex flex-col gap-3 lg:mb-16">
          <Eyebrow>{t("spotlightEyebrow")}</Eyebrow>
          <h2 id="home-spotlight-title" className="text-balance text-heading-2 text-ink">
            {t("spotlightHeading")}
          </h2>
          <p className="max-w-[56ch] text-body text-ink-2">{t("spotlightBody")}</p>
        </header>
      </div>
      <StudentSpotlightScroller students={students} />
      <div className="mx-auto mt-12 flex max-w-[1280px] flex-col items-start gap-3 px-4 sm:px-6 lg:mt-16 lg:flex-row lg:items-center lg:justify-between lg:px-[6%]">
        <p className="max-w-[44ch] text-body-sm text-ink-2">{t("spotlightNote")}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/students"
            className="inline-flex min-h-[44px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
          >
            {t("spotlightSeeAllStudents")}
          </Link>
          <Link
            href="/be-a-donor"
            className="inline-flex min-h-[44px] items-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
          >
            {t("spotlightBeADonor")}
          </Link>
        </div>
      </div>
    </section>
  );
}
