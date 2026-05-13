import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Wide-coverage axe sweep for the final a11y gate. Per-phase specs
// (phase-7, phase-8) still cover route-specific behavioral checks.
const ROUTES = [
  "/",
  "/about",
  "/donors",
  "/gallery",
  "/testimonials",
  "/donate",
  "/donate/thank-you",
  "/contact",
  "/terms",
  "/students",
  "/projects",
  "/blog",
  "/activities",
  "/success-stories",
  "/blog/fall-2025-field-update",
  "/success-stories/priya-university-dhaka",
] as const;

test.beforeEach(async ({ page }) => {
  // Block the external Givebutter widget so axe runs do not depend on a third-party CDN.
  await page.route(/widgets\.givebutter\.com/, (route) => route.abort());
});

for (const route of ROUTES) {
  test(`${route} has zero axe violations under reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test(`${route} has zero axe violations under full motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route);
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}
