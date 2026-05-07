import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const ROUTES = ["/about", "/donors", "/gallery", "/testimonials"] as const;

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

test("/testimonials filter syncs to ?role= URL and honors invalid role", async ({ page }) => {
  await page.goto("/testimonials");
  const teachersChip = page.getByRole("button", { name: /^Teachers/ });
  if (await teachersChip.count()) {
    await teachersChip.first().click();
    await expect(page).toHaveURL(/\/testimonials\?role=teacher/);
    await page.goBack();
    await expect(page).toHaveURL(/\/testimonials$/);
  }

  await page.goto("/testimonials?role=bogus");
  const allChip = page.getByRole("button", { name: /^All/ });
  await expect(allChip).toHaveAttribute("aria-pressed", "true");
});

test("/gallery images lazy-load below the fold", async ({ page }) => {
  await page.goto("/gallery");
  const firstImg = page.locator("main img").first();
  await expect(firstImg).toBeVisible();
  const lazyImgs = page.locator('main img[loading="lazy"]');
  expect(await lazyImgs.count()).toBeGreaterThan(0);
});

test("/donors hero H1 names the donor total in accessible text", async ({ page }) => {
  await page.goto("/donors");
  const heroTitle = page.locator("#donors-hero-title");
  await expect(heroTitle).toContainText(/\d+ anonymous donors so far\./);
});
