import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";

type ProjectsHeroProps = {
  count: number;
  totalRaised: number;
};

export async function ProjectsHero({ count, totalRaised }: ProjectsHeroProps) {
  const t = await getTranslations("projectsPageExtra");
  return (
    <section
      aria-labelledby="projects-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <Eyebrow>{t("heroEyebrow")}</Eyebrow>
        <h1 id="projects-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
          {t("heroTitle")}
        </h1>
        <p className="max-w-[28ch] text-balance text-heading-2 text-accent">
          ${totalRaised.toLocaleString()} funded across {count}{" "}
          {count === 1 ? "project" : "projects"}.
        </p>
        <p className="max-w-[44ch] text-body-lg text-ink-2">{t("heroIntro")}</p>
      </div>
    </section>
  );
}
