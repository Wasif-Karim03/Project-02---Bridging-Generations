"use client";

import { useEffect, useState } from "react";
import type { ExtractedHeading } from "@/lib/content/extractHeadings";

type StoryTocProps = {
  headings: ExtractedHeading[];
  /** Optional summary label for the mobile <details>. */
  label?: string;
};

export function StoryToc({ headings, label = "On this page" }: StoryTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0% -60% 0%", threshold: [0, 0.5, 1] },
    );
    for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <>
      <nav className="toc-sticky" aria-label={label}>
        <ul className="toc-sticky__list">
          {headings.map((h) => (
            <li
              key={h.id}
              className="toc-sticky__item"
              data-active={activeId === h.id ? "true" : "false"}
            >
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </nav>
      <details className="toc-collapsible">
        <summary>{label}</summary>
        <ul className="toc-collapsible__list">
          {headings.map((h) => (
            <li
              key={h.id}
              className="toc-collapsible__item"
              data-active={activeId === h.id ? "true" : "false"}
            >
              <a href={`#${h.id}`}>{h.text}</a>
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
