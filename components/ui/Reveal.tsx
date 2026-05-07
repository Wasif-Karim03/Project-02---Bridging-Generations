"use client";

import { Children, type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";
import { RevealVisibleProvider } from "./RevealVisibleContext";

// For act-break boundaries on long pages (the `horizon` motion in the R4.9
// vocabulary), use `components/ui/SectionAct.tsx` instead — it ships a
// 1px hairline + settle motion above the wrapped content. Reveal handles
// per-element fade/translate; SectionAct handles section-entry punctuation.

const CASCADE_MAX_MS = 600;
const CASCADE_DEFAULT_MS = 150;

type Stagger = "up" | "left" | "right" | "scale-in";
type RevealKind = "default" | "develop" | "draw-underline" | "count-up-wrapper";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  stagger?: Stagger;
  cascade?: boolean;
  cascadeDelay?: number;
  className?: string;
  kind?: RevealKind;
};

export function Reveal({
  children,
  delay = 0,
  stagger,
  cascade = false,
  cascadeDelay = CASCADE_DEFAULT_MS,
  className,
  kind = "default",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [developed, setDeveloped] = useState(false);

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

  // Latch `developed` when the filter transition actually settles. Listening for
  // transitionend keeps us in sync with whatever duration CSS gives the animation
  // (900ms desktop, 720ms mobile per the Prompt 7 motion-tier override) — a
  // hardcoded timeout would fire late on mobile and miss any future tweak.
  useEffect(() => {
    if (!visible || kind !== "develop") return;
    const el = ref.current;
    if (!el) return;
    // Reduced-motion: CSS sets `transition: none`, so transitionend never fires.
    // Latch immediately so the spec marker still arrives.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDeveloped(true);
      return;
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== "filter") return;
      setDeveloped(true);
      el.removeEventListener("transitionend", onEnd);
    };
    el.addEventListener("transitionend", onEnd);
    // Safety net: if transitionend is dropped (interrupted animation, GC'd node),
    // latch within a window comfortably past both the desktop and mobile durations.
    const fallback = window.setTimeout(() => setDeveloped(true), 1500);
    return () => {
      el.removeEventListener("transitionend", onEnd);
      window.clearTimeout(fallback);
    };
  }, [visible, kind]);

  const classes = `reveal-on-scroll${visible ? " is-visible" : ""}${
    developed ? " developed" : ""
  }${className ? ` ${className}` : ""}`;
  const style = delay ? { transitionDelay: `${delay}ms` } : undefined;
  const dataAttrs: Record<string, string> = {};
  if (stagger) dataAttrs["data-reveal-stagger"] = stagger;
  if (cascade) dataAttrs["data-reveal-cascade"] = "";
  if (kind !== "default") dataAttrs["data-reveal-kind"] = kind;

  const content = cascade
    ? Children.map(children, (child, index) => {
        const itemDelay = Math.min(index * cascadeDelay, CASCADE_MAX_MS);
        return (
          <div data-reveal-item="" style={{ "--reveal-delay": `${itemDelay}ms` } as CSSProperties}>
            {child}
          </div>
        );
      })
    : children;

  const body =
    kind === "count-up-wrapper" ? (
      <RevealVisibleProvider value={visible}>{content}</RevealVisibleProvider>
    ) : (
      content
    );

  return (
    <div ref={ref} className={classes} style={style} {...dataAttrs}>
      {body}
      {kind === "draw-underline" ? <HandDrawnUnderline className="reveal-underline" /> : null}
    </div>
  );
}
