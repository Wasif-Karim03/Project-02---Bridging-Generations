import { describe, expect, it } from "vitest";
import { isPlaceholder } from "@/lib/content/isPlaceholder";

describe("isPlaceholder", () => {
  it("treats a [CONFIRM:] token as a placeholder", () => {
    expect(isPlaceholder("[CONFIRM: mailing address]")).toBe(true);
  });

  it("trims leading whitespace before checking", () => {
    expect(isPlaceholder("   [CONFIRM: ein]")).toBe(true);
  });

  it("treats a real value as non-placeholder", () => {
    expect(isPlaceholder("123 Main St, Brooklyn NY 11201")).toBe(false);
  });

  it("treats an empty string as a placeholder", () => {
    expect(isPlaceholder("")).toBe(true);
  });

  it("treats null as a placeholder", () => {
    expect(isPlaceholder(null)).toBe(true);
  });

  it("treats undefined as a placeholder", () => {
    expect(isPlaceholder(undefined)).toBe(true);
  });

  it("does not flag a string that merely contains [CONFIRM: mid-sentence", () => {
    expect(isPlaceholder("Per the RFP [CONFIRM: is acceptable] later")).toBe(false);
  });
});
