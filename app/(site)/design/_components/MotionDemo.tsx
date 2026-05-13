"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { type CubicBezier, easingPath } from "@/lib/motion/easingPath";

const CYCLE_INTERVAL_MS = 6000;

type MotionDemoProps = {
  /** Display name of the motion (lowercase token name). */
  name: string;
  /** Reference path to where the motion is defined. */
  source: string;
  /** Duration in ms (used for the timing-diagram label). */
  durationMs: number;
  /** Cubic-bezier control points for the easing curve sketch. */
  easing: CubicBezier;
  /** Token reference for the easing curve. */
  easingToken: string;
  /** One-line description of how the motion behaves under prefers-reduced-motion. */
  reducedMotion: string;
  /** The animated demo. Re-keyed on Replay so animations restart. */
  children: ReactNode;
  /** Static end-state preview that mirrors the prefers-reduced-motion fallback. */
  reducedPreview: ReactNode;
  /**
   * When true (default), the motion side re-keys every 6s while in viewport
   * so the animation continuously plays — a comparative loop against the
   * static reduced pane. Skipped under prefers-reduced-motion. Set to false
   * for motions that intrinsically loop (e.g., `kenburns` runs `infinite
   * alternate` — re-keying would interrupt its own cycle).
   */
  autoCycle?: boolean;
};

/**
 * Editorial demo block for one named motion in the R4.9 motion vocabulary.
 * Renders side-by-side motion / reduced previews, a timing diagram (duration
 * label + easing curve sketch via easingPath), and a Replay button that
 * remounts the demo so the animation restarts. The motion side auto-cycles
 * every 6s while in viewport so the comparative delta stays visible without
 * requiring the reader to press Replay (motion-safe; skipped under
 * prefers-reduced-motion).
 */
export function MotionDemo({
  name,
  source,
  durationMs,
  easing,
  easingToken,
  reducedMotion,
  children,
  reducedPreview,
  autoCycle = true,
}: MotionDemoProps) {
  const [key, setKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoCycle) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = containerRef.current;
    if (!el) return;
    let interval: number | null = null;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && interval === null) {
          interval = window.setInterval(() => setKey((k) => k + 1), CYCLE_INTERVAL_MS);
        } else if (!entry.isIntersecting && interval !== null) {
          window.clearInterval(interval);
          interval = null;
        }
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (interval !== null) window.clearInterval(interval);
    };
  }, [autoCycle]);

  return (
    <div ref={containerRef} className="border-t border-hairline pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink">{name}</p>
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          ↺ Replay
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <figure className="m-0">
          <figcaption className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
            Motion
          </figcaption>
          <div key={key} className="mt-2">
            {children}
          </div>
        </figure>
        <figure className="m-0">
          <figcaption className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
            Reduced
          </figcaption>
          <div className="mt-2">{reducedPreview}</div>
        </figure>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <svg
          viewBox="0 0 60 30"
          className="h-8 w-[60px] shrink-0 text-accent"
          aria-hidden="true"
          fill="none"
        >
          <path
            d={easingPath(easing, 60, 30)}
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-meta uppercase tracking-[0.1em]">
            <span className="break-all text-ink-2">{source}</span>
            <span aria-hidden="true" className="text-hairline">
              {" "}
              ·{" "}
            </span>
            <span className="text-ink">{durationMs}ms</span>
            <span aria-hidden="true" className="text-hairline">
              {" "}
              ·{" "}
            </span>
            <span className="text-ink-2">{easingToken}</span>
          </p>
          <p className="mt-1 text-body-sm text-ink-2">{reducedMotion}</p>
        </div>
      </div>
    </div>
  );
}
