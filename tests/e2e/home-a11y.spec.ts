import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("home route has zero axe violations under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("home route has zero axe violations under full motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  // Allow GSAP entrance timeline + Reveal observers to settle.
  await page.waitForTimeout(1500);
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("home has exactly one h1 and at least one main + nav + contentinfo landmark", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});

test("hero CTAs, nav brand, and closing CTA are keyboard reachable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Sponsor a Student" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Donate now" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip to main content/i })).toBeFocused();

  // Navigate into the primary nav — expect the brand link to be the next tab stop.
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /bridging generations/i })).toBeFocused();
});

test("student spotlight scroller is a keyboard-focusable named region", async ({ page }) => {
  await page.goto("/");
  const region = page.getByRole("region", { name: /student spotlight/i });
  await expect(region).toBeVisible();
  await region.focus();
  await expect(region).toBeFocused();
});

test("all hero copy is visible under reduced motion (no invisible opacity-0 elements)", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText("156 students.");
  const opacity = await heading.evaluate((el) => window.getComputedStyle(el).opacity);
  expect(Number(opacity)).toBe(1);
});
