"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "next-view-transitions";
import { useCallback } from "react";
import { BLOG_CATEGORY_OPTIONS } from "@/keystatic/collections/blogPost";

type Counts = Record<string, number>;

type BlogCategoryFilterProps = {
  counts: Counts;
  active: string; // "" = All
};

const TABS = [{ value: "", label: "All" }, ...BLOG_CATEGORY_OPTIONS] as const;

// URL-driven filter — toggling a tab updates ?category=... so the user can
// share/bookmark a filtered view. The server reads the query param and
// re-renders the filtered list.
export function BlogCategoryFilter({ counts, active }: BlogCategoryFilterProps) {
  const router = useRouter();
  const params = useSearchParams();

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
      {TABS.map((tab) => {
        const isActive = active === tab.value;
        const count = tab.value === "" ? (counts.__all__ ?? 0) : (counts[tab.value] ?? 0);
        return (
          <Link
            key={tab.value || "all"}
            href={buildHref(tab.value)}
            role="tab"
            aria-selected={isActive}
            onClick={(e) => {
              // Use the router so we don't lose scroll position on navigation
              // for already-loaded routes; let the Link otherwise handle SSR.
              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
              e.preventDefault();
              router.push(buildHref(tab.value), { scroll: false });
            }}
            className={
              isActive
                ? "inline-flex min-h-[36px] items-center bg-accent px-4 text-meta uppercase tracking-[0.08em] text-white transition-colors"
                : "inline-flex min-h-[36px] items-center border border-hairline bg-ground-2 px-4 text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
            }
          >
            {tab.label}
            <span className="ml-2 opacity-70">({count})</span>
          </Link>
        );
      })}
    </div>
  );
}
