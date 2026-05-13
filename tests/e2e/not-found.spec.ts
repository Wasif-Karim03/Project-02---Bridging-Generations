import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("unknown route renders the friendly 404", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /somewhere in the Hill Tracts/i })).toBeVisible();

  const destinations = page.getByRole("navigation", { name: "Standing destinations" });
  await expect(destinations.getByRole("link", { name: "Read a student's story" })).toHaveAttribute(
    "href",
    "/success-stories",
  );
  await expect(destinations.getByRole("link", { name: "See recent activity" })).toHaveAttribute(
    "href",
    "/activities",
  );
  await expect(destinations.getByRole("link", { name: "Donate" })).toHaveAttribute(
    "href",
    "/donate",
  );
});

test("404 is marked noindex", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  const robotsMetas = page.locator('meta[name="robots"]');
  const count = await robotsMetas.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const content = await robotsMetas.nth(i).getAttribute("content");
    expect(content).toMatch(/noindex/);
  }
});

test("404 has zero axe violations at WCAG 2.2 AA", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
