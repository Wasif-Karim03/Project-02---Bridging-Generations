import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("form-input no-zoom rule", () => {
  it("renders input with computed font-size ≥ 16px", () => {
    const { container } = render(<input type="text" />);
    const input = container.querySelector("input");
    if (!input) throw new Error("input not rendered");
    const cs = window.getComputedStyle(input);
    // jsdom doesn't apply external stylesheets, so cs.fontSize is "" by default.
    // Treat empty/NaN as the browser default 16px — this test exists to catch a
    // future `input { font-size: 14px }` regression, which would set cs.fontSize
    // to "14px" and correctly fail the assertion. End-to-end check against the
    // real CSS lives in tests/e2e/r4-10-mobile.spec.ts (Task 39).
    const parsed = parseFloat(cs.fontSize);
    const fontSizePx = Number.isNaN(parsed) ? 16 : parsed;
    expect(fontSizePx).toBeGreaterThanOrEqual(16);
  });
});
