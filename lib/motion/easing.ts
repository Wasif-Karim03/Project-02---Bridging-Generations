/**
 * Cubic ease-out, perceptually aligned with the site's --ease-smooth CSS curve
 * (cubic-bezier(0.16, 1, 0.3, 1)). Used by rAF-driven count-ups so they feel
 * consistent with CSS-driven transitions that share the same token.
 */
export function easeOutSmooth(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - (1 - t) ** 3;
}
