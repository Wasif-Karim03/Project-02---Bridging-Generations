import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";

export async function BackToStories() {
  const t = await getTranslations("successStoriesPage");
  return (
    <div className="bg-ground px-4 pt-10 sm:px-6 lg:px-[6%]">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href="/success-stories"
          className="group inline-flex items-center gap-1 text-nav-link uppercase text-accent transition hover:text-accent-2-text"
        >
          <span
            aria-hidden="true"
            className="transition-transform motion-safe:group-hover:-translate-x-1"
          >
            ←
          </span>
          {t("allStories")}
        </Link>
      </div>
    </div>
  );
}
