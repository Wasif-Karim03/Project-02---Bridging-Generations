"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Act-break primitive for long pages. Renders a 1px hairline that settles in
 * above the wrapped heading as the section scrolls into view (the `horizon`
 * motion in the R4.9 motion vocabulary — see app/globals.css §9).
 *
 * **Act-break rule.** An act break is the boundary between two sections that
 * change argumentative mode (intro → evidence, evidence → counter, counter →
 * resolution). Continuation of the same argument gets no motion. Default:
 * 2-3 act breaks per long page maximum. Not every H2 is an act break — that
 * would put motion everywhere and erode the punctuation.
 *
 * Applied at:
 *   - /design — boundaries between Foundation, Components, Composition, Motion Lab.
 *   - /terms — boundaries between major thematic groups.
 *   - /blog/[slug] — between lede and body.
 *   - /success-stories/[slug] — between hero and first chapter (ChapterBreak handles the rest).
 */
type SectionActProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionAct({ children, className, id }: SectionActProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            return;
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = `section-act${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`;
  return (
    <section ref={ref} id={id} className={classes}>
      {children}
    </section>
  );
}
