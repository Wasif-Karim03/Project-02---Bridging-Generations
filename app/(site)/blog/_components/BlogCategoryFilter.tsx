"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "next-view-transitions";
import { useCallback, useMemo } from "react";
import { BLOG_CATEGORY_OPTIONS } from "@/keystatic/collections/blogPost";

type Counts = Record<string, number>;

type BlogCategoryFilterProps = {
  counts: Counts;
  active: string; // "" = All
};

const CATEGORY_VALUES = ["", ...BLOG_CATEGORY_OPTIONS.map((o) => o.value)] as const;

export function BlogCategoryFilter({ counts, active }: BlogCategoryFilterProps) {
  const t = useTranslations("blog");
  const locale = useLocale();
  const fmt = useMemo(() => new Intl.NumberFormat(locale, { useGrouping: false }), [locale]);
  const router = useRouter();
  const params = useSearchParams();

  const tabLabel: Record<string, string> = {
    "": t("filterAll"),
    "success-story": t("filterSuccessStory"),
    "recent-activity": t("filterRecentActivity"),
    "event-news": t("filterEventNews"),
  };

  const buildHref = useCallback(
    (value: string) => {
      const next = new URLSearchParams(params?.toString() ?? "");
      if (value) next.set("category", value);
      else next.delete("category");
      next.delete("page");
      const qs = next.toString();
      return qs ? `/blog?${qs}` : "/blog";
    },
    [params],
  );

  return (
    <div role="tablist" aria-label="Filter blog posts" className="flex flex-wrap gap-2">
      {CATEGORY_VALUES.map((value) => {
        const isActive = active === value;
        const count = value === "" ? (counts.__all__ ?? 0) : (counts[value] ?? 0);
        return (
          <Link
            key={value || "all"}
            href={buildHref(value)}
            role="tab"
            aria-selected={isActive}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              router.push(buildHref(value), { scroll: false });
            }}
            className={
              isActive
                ? "inline-flex min-h-[36px] items-center bg-accent px-4 text-meta uppercase tracking-[0.08em] text-white transition-colors"
                : "inline-flex min-h-[36px] items-center border border-hairline bg-ground-2 px-4 text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
            }
          >
            {tabLabel[value]}
            <span className="ml-2 opacity-70">({fmt.format(count)})</span>
          </Link>
        );
      })}
    </div>
  );
}
