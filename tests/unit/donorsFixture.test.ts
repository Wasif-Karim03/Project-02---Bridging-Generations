import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Tests run from the site/ working directory.
const fixturePath = join(process.cwd(), "content", "donors-page", "index.yaml");
const fixtureText = readFileSync(fixturePath, "utf8");

const messageLines = fixtureText
  .split("\n")
  .filter(
    (line) => line.trimStart().startsWith("- message:") || line.trimStart().startsWith("message:"),
  )
  .map((line) => line.replace(/^\s*-?\s*message:\s*/, "").trim());

describe("donors-page fixture PII safety", () => {
  it("loads at least one message", () => {
    expect(messageLines.length).toBeGreaterThan(0);
  });

  it("contains no dollar signs", () => {
    for (const line of messageLines) {
      expect(line).not.toMatch(/\$/);
    }
  });

  it("contains no USD or dollar tokens", () => {
    for (const line of messageLines) {
      expect(line.toLowerCase()).not.toMatch(/\busd\b/);
      expect(line.toLowerCase()).not.toMatch(/\bdollars?\b/);
    }
  });

  it("contains no numeric amount patterns", () => {
    for (const line of messageLines) {
      expect(line).not.toMatch(/\b\d+(?:,\d{3})+\b/);
      expect(line).not.toMatch(/\b\d{3,}\b/);
    }
  });

  it("contains no obvious full-name patterns (two consecutive capitalized words)", () => {
    for (const line of messageLines) {
      const stripped = line.replace(/^['"]|['"]$/g, "");
      const trimmed = stripped.replace(/^[A-Z][a-z]+/, "");
      expect(trimmed).not.toMatch(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/);
    }
  });
});
