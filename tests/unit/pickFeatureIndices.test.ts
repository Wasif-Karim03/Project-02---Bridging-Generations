import { describe, expect, it } from "vitest";
import { pickFeatureIndices } from "@/lib/projects/pickFeatureIndices";

describe("pickFeatureIndices", () => {
  it("returns empty set for n=0", () => {
    expect(pickFeatureIndices(0)).toEqual(new Set());
  });

  it("returns {0} for n=1", () => {
    expect(pickFeatureIndices(1)).toEqual(new Set([0]));
  });

  it("features only index 0 for n<4", () => {
    expect(pickFeatureIndices(2)).toEqual(new Set([0]));
    expect(pickFeatureIndices(3)).toEqual(new Set([0]));
  });

  it("features 0 and 4 at n=8", () => {
    expect(pickFeatureIndices(8)).toEqual(new Set([0, 4]));
  });

  it("features 0, 4, 8, 12 at n=15", () => {
    expect(pickFeatureIndices(15)).toEqual(new Set([0, 4, 8, 12]));
  });

  it("never picks an index >= n", () => {
    const result = pickFeatureIndices(10);
    for (const i of result) {
      expect(i).toBeLessThan(10);
    }
  });
});
