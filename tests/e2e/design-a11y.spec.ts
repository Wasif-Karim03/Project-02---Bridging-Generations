import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("design route has zero axe violations at WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/design");
  await expect(page.getByRole("heading", { name: "Design System", level: 1 })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("design route is keyboard reachable from main landmark", async ({ page }) => {
  await page.goto("/design");
  const firstNavLink = page.locator('nav[aria-label="Design system sections"] a').first();
  await firstNavLink.focus();
  await expect(firstNavLink).toBeFocused();
});
