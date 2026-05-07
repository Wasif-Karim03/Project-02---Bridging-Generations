import { expect, test } from "@playwright/test";

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

const VIEWPORTS = [
  { width: 320, height: 640, label: "320w" },
  { width: 375, height: 812, label: "375w" },
  { width: 402, height: 874, label: "402w" },
  { width: 768, height: 1024, label: "768w" },
  { width: 1280, height: 800, label: "1280w" },
] as const;

test.beforeEach(async ({ page }) => {
  await page.route(/widgets\.givebutter\.com/, (route) => route.abort());
});

for (const route of ROUTES) {
  for (const viewport of VIEWPORTS) {
    test(`${route} has no horizontal overflow at ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        };
      });
      // Allow a 1px rounding tolerance — browsers occasionally report scrollWidth
      // fractionally above innerWidth due to subpixel layout.
      expect(
        overflow.scrollWidth,
        `scrollWidth ${overflow.scrollWidth} exceeds innerWidth ${overflow.innerWidth} on ${route} @ ${viewport.label}`,
      ).toBeLessThanOrEqual(overflow.innerWidth + 1);
    });
  }
}
