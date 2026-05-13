"use client";

import Lenis from "lenis";
import { useEffect } from "react";

export function SmoothScroll() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Lenis is wheel-only smoothing; on touch devices iOS Safari's native
    // momentum scroll is the expected feel and Lenis adds no wheel value.
    // Gating on (pointer: fine) keeps Lenis off iPhones/iPads while
    // preserving the desktop wheel experience.
    const finePointer = window.matchMedia("(pointer: fine)");
    if (reducedMotion.matches || !finePointer.matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let raf = requestAnimationFrame(function tick(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    });

    const onPrefChange = () => {
      if (reducedMotion.matches) {
        cancelAnimationFrame(raf);
        lenis.destroy();
      }
    };
    reducedMotion.addEventListener("change", onPrefChange);

    return () => {
      reducedMotion.removeEventListener("change", onPrefChange);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
