import { describe, expect, it } from "vitest";
import { easeOutSmooth } from "@/lib/motion/easing";

describe("easeOutSmooth", () => {
  it("returns 0 at t=0", () => {
    expect(easeOutSmooth(0)).toBe(0);
  });

  it("returns 1 at t=1", () => {
    expect(easeOutSmooth(1)).toBe(1);
  });

  it("clamps values below 0 to 0", () => {
    expect(easeOutSmooth(-0.5)).toBe(0);
  });

  it("clamps values above 1 to 1", () => {
    expect(easeOutSmooth(1.5)).toBe(1);
  });

  it("is monotonically increasing over [0, 1]", () => {
    let prev = -Infinity;
    for (let i = 0; i <= 10; i++) {
      const y = easeOutSmooth(i / 10);
      expect(y).toBeGreaterThanOrEqual(prev);
      prev = y;
    }
  });

  it("accelerates early (ease-out shape)", () => {
    // Value at t=0.5 should be well past the midpoint.
    expect(easeOutSmooth(0.5)).toBeGreaterThan(0.8);
  });
});
