"use client";

import { Link } from "next-view-transitions";
import { useMemo } from "react";

export type NewsTickerItem = {
  id: string;
  title: string;
  href: string;
};

type HomeNewsTickerProps = {
  items: NewsTickerItem[];
};

// Auto-scrolling announcement strip. Renders the items twice in a single
// row so the CSS `animation: ticker-scroll` can translate-x -50% in one
// loop without a visible jump. Pauses on hover; respects
// prefers-reduced-motion.
export function HomeNewsTicker({ items }: HomeNewsTickerProps) {
  // Memo runs unconditionally — the empty-list branch returns *after* hooks.
  const doubled = useMemo(() => [...items, ...items], [items]);

  // Tune the duration to keep readable scroll speed regardless of item count:
  // ~6s per item works visually.
  const durationSeconds = Math.max(20, items.length * 6);

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Latest activity"
      className="relative overflow-hidden border-b border-hairline bg-ground-3"
    >
      <div className="mx-auto flex max-w-[1280px] items-center px-4 sm:px-6 lg:px-[6%]">
        <p className="shrink-0 pr-4 py-2 text-eyebrow uppercase text-accent">Latest</p>
        <div className="group relative flex-1 overflow-hidden">
          <div
            className="ticker-track flex whitespace-nowrap py-2"
            style={{ ["--ticker-duration" as string]: `${durationSeconds}s` }}
          >
            {doubled.map((item, idx) => {
              // `idx` distinguishes the duplicated copies of the same item id —
              // we render the items list twice for the seamless marquee loop.
              const isClone = idx >= items.length;
              return (
                <Link
                  key={`${item.id}-${isClone ? "clone" : "lead"}`}
                  href={item.href}
                  aria-hidden={isClone ? "true" : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  className="mr-10 inline-flex items-center gap-2 text-body-sm text-ink-2 transition-colors hover:text-accent"
                >
                  <span aria-hidden="true" className="text-accent-2-text">
                    ◆
                  </span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll var(--ticker-duration) linear infinite;
        }
        .group:hover .ticker-track,
        .ticker-track:focus-within {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
