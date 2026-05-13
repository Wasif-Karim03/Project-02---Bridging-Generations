"use client";

import { useEffect, useRef, useState } from "react";
import { StudentCard } from "@/components/domain/StudentCard";
import type { Student } from "@/lib/content/students";

type StudentSpotlightScrollerProps = {
  students: Student[];
  ariaLabel?: string;
  hint?: boolean;
};

const SESSION_KEY = "bg:spotlight-hint-seen";

export function StudentSpotlightScroller({
  students,
  ariaLabel = "Student spotlight — scroll horizontally to browse",
  hint = true,
}: StudentSpotlightScrollerProps) {
  const scrollRef = useRef<HTMLElement>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hint) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage may throw in locked-down contexts; fall through as "not seen"
    }
    if (seen) return;
    setShowHint(true);
    const dismiss = () => {
      setShowHint(false);
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
    };
    const timer = window.setTimeout(dismiss, 3500);
    const el = scrollRef.current;
    el?.addEventListener("scroll", dismiss, { once: true, passive: true });
    return () => {
      clearTimeout(timer);
      el?.removeEventListener("scroll", dismiss);
    };
  }, [hint]);

  return (
    <div className="relative">
      <section
        ref={scrollRef}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scroll region needs keyboard focus so arrow keys scroll horizontally
        tabIndex={0}
        aria-label={ariaLabel}
        data-lenis-prevent
        // touch-pan-x + overscroll-x-contain: tell the browser this is a horizontal-only
        // scroller. Without it, vertical swipes whose finger lands inside the scroller
        // get routed to the snap-mandatory horizontal scroll and the page scroll halts
        // mid-travel — visible as the "stuck mid page" bug on / and /students.
        // data-lenis-prevent: opt this nested scroller out of Lenis wheel hijacking.
        className="touch-pan-x overflow-x-auto overscroll-x-contain scroll-smooth focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
      >
        <ul className="flex snap-x snap-mandatory gap-5 px-4 pb-6 sm:px-6 lg:px-[6%]">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex w-[80vw] max-w-[320px] flex-none snap-start sm:w-[320px] lg:w-[360px]"
            >
              <StudentCard student={student} variant="spotlight" />
            </li>
          ))}
        </ul>
      </section>
      {showHint && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[40%] right-2 -translate-y-1/2 text-display-2 text-accent-2-text opacity-70 transition-opacity duration-500 sm:right-6 lg:right-12"
        >
          →
        </span>
      )}
    </div>
  );
}
