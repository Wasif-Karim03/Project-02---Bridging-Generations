"use client";

import { useEffect, useRef } from "react";

export function ScrollProgressRule({ barClassName }: { barClassName?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Chrome 115+ handles progression inside CSS via animation-timeline — skip JS.
    if (
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("animation-timeline", "scroll(root)")
    ) {
      return;
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.style.transform = "scaleX(1)";
      return;
    }

    let raf: number | null = null;
    const update = () => {
      raf = null;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 1;
      el.style.transform = `scaleX(${progress})`;
    };
    const onScroll = () => {
      if (raf !== null) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`scroll-progress-rule pointer-events-none fixed left-0 top-0 z-[60] h-[2px] w-full origin-left transition-colors duration-300 ${barClassName ?? "bg-white"}`}
      style={{ transform: "scaleX(0)" }}
    />
  );
}
