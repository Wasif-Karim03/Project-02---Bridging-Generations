import { expect, test } from "@playwright/test";

test("home hero LCP image carries fetchpriority=high", async ({ page }) => {
  await page.goto("/");
  // Locks in the priority → fetchpriority mapping. Next 16's `priority` prop
  // alone does NOT set fetchpriority on the rendered <img> (Prompt 8 audit
  // finding) — explicit fetchPriority="high" is required for the LCP gate.
  const heroImg = page.locator('img[src*="home-hero"]').first();
  await expect(heroImg).toHaveAttribute("fetchpriority", "high");
});
