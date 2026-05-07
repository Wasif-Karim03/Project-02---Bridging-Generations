import { describe, expect, it } from "vitest";
import { relativeTime } from "@/lib/dates/relativeTime";

const NOW = new Date("2026-04-27T12:00:00Z");

describe("relativeTime", () => {
  it("returns 'yesterday' for one day ago", () => {
    const date = new Date("2026-04-26T12:00:00Z");
    expect(relativeTime(date, NOW)).toBe("yesterday");
  });

  it("returns weeks for a 3-week-old date", () => {
    const date = new Date("2026-04-06T12:00:00Z");
    expect(relativeTime(date, NOW)).toBe("3 weeks ago");
  });

  it("returns months for a 2-month-old date", () => {
    const date = new Date("2026-02-26T12:00:00Z");
    expect(relativeTime(date, NOW)).toBe("2 months ago");
  });

  it("falls back to absolute date for >=12 months", () => {
    const date = new Date("2024-04-01T12:00:00Z");
    const result = relativeTime(date, NOW);
    expect(result).toMatch(/2024/);
  });

  it("handles future dates", () => {
    const date = new Date("2026-05-04T12:00:00Z");
    expect(relativeTime(date, NOW)).toBe("next week");
  });

  it("returns 'today' for very recent dates", () => {
    const date = new Date("2026-04-27T11:30:00Z");
    expect(relativeTime(date, NOW)).toMatch(/(minute|hour|now|today)/);
  });
});
