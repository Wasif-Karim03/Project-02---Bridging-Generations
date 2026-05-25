import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/ui/Reveal";

type GalleryHeroProps = {
  count: number;
};

export async function GalleryHero({ count }: GalleryHeroProps) {
  const t = await getTranslations("gallery");
  return (
    <section
      aria-labelledby="gallery-hero-title"
      className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
    >
      <Reveal>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
          <h1 id="gallery-hero-title" className="max-w-[18ch] text-balance text-display-2 text-ink">
            {t("title")}
          </h1>
          <p className="max-w-[44ch] text-body-lg text-ink-2">{t("description")}</p>
          <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
            <li>{t("statPhotographs", { count })}</li>
            <li>{t("statPartnerSchools")}</li>
            <li>{t("statFieldReports")}</li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
