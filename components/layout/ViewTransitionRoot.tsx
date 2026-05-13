import { ViewTransitions } from "next-view-transitions";
import type { ReactNode } from "react";

// Firefox 131+ supports cross-document view transitions natively via
// @view-transition; older Firefox + older Safari get an abrupt nav (acceptable).
// No GSAP fallback — out of scope per FE/perf trade.
export function ViewTransitionRoot({ children }: { children: ReactNode }) {
  return <ViewTransitions>{children}</ViewTransitions>;
}
