import { getTranslations } from "next-intl/server";
import { Eyebrow } from "@/components/ui/Eyebrow";

type BlogHeroProps = {
  count: number;
  mostRecent?: string | null;
};

export async function BlogHero({ count, mostRecent }: BlogHeroProps) {
  const t = await getTranslations("blog");
  return (
    <section
      aria-labelledby="blog-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 id="blog-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
          {t("title")}
        </h1>
        <p className="max-w-[44ch] text-body-lg text-ink-2">{t("description")}</p>
        <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
          <li>{t("statPosts", { count })}</li>
          {mostRecent ? (
            <li>
              {t("statMostRecent")} · {mostRecent}
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
