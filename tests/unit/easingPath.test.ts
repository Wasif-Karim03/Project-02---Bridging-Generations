import { describe, expect, it } from "vitest";
import { easingPath } from "@/lib/motion/easingPath";

describe("easingPath", () => {
  it("starts at (0, height) and ends at (width, 0)", () => {
    const path = easingPath([0.16, 1, 0.3, 1], 40, 40);
    expect(path).toMatch(/^M 0 40 C/);
    expect(path).toMatch(/40 0$/);
  });

  it("maps a center control-point pair to the box midpoint", () => {
    expect(easingPath([0.5, 0.5, 0.5, 0.5], 100, 100)).toBe("M 0 100 C 50 50 50 50 100 0");
  });

  it("renders the --ease-smooth curve (cubic-bezier(0.16, 1, 0.3, 1))", () => {
    // cp1 = (0.16*40, (1-1)*40) = (6.4, 0); cp2 = (0.3*40, (1-1)*40) = (12, 0)
    expect(easingPath([0.16, 1, 0.3, 1], 40, 40)).toBe("M 0 40 C 6.4 0 12 0 40 0");
  });

  it("renders the --ease-in-out curve (cubic-bezier(0.4, 0, 0.2, 1))", () => {
    // cp1 = (16, 40), cp2 = (8, 0)
    expect(easingPath([0.4, 0, 0.2, 1], 40, 40)).toBe("M 0 40 C 16 40 8 0 40 0");
  });

  it("renders linear (cubic-bezier(0, 0, 1, 1)) as a diagonal", () => {
    // cp1 = (0, 40), cp2 = (40, 0)
    expect(easingPath([0, 0, 1, 1], 40, 40)).toBe("M 0 40 C 0 40 40 0 40 0");
  });

  it("scales independently in width and height", () => {
    expect(easingPath([0.5, 0.5, 0.5, 0.5], 80, 20)).toBe("M 0 20 C 40 10 40 10 80 0");
  });
});
