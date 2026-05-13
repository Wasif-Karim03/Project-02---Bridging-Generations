// Pick which list indices receive Feature scale (vs Row). Replaces the
// "index === 0 only" rule that fired the breakout treatment exactly once
// regardless of list length. R4.5 Feature primitives are intended to
// alternate as scale-of-importance markers, not flag a single hero.
//
// Cadence: every fourth item starting from index 0 — 0, 4, 8, 12 …
// At n=1 the singleton gets Feature. At n<4 only index 0 is featured.
// At n=4 indices 0 are featured; at n=8 indices 0 and 4 are featured; etc.
const FEATURE_STRIDE = 4;

export function pickFeatureIndices(n: number): Set<number> {
  if (n <= 0) return new Set();
  const result = new Set<number>();
  for (let i = 0; i < n; i += FEATURE_STRIDE) {
    result.add(i);
  }
  return result;
}
