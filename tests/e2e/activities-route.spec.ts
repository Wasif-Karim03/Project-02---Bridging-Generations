import { expect, test } from "@playwright/test";

test("activities route renders hero, filter chips, timeline, and CTA", async ({ page }) => {
  await page.goto("/activities");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Recent activities");

  const filterGroup = page.getByRole("group", { name: /filter activities/i });
  await expect(filterGroup).toBeVisible();
  await expect(filterGroup.getByRole("button", { name: /^All/ })).toBeVisible();

  const listItems = page.getByRole("listitem");
  const totalCount = await listItems.count();
  expect(totalCount).toBeGreaterThan(1);

  await filterGroup.getByRole("button", { name: "Visit" }).click();
  const afterFilter = await page.getByRole("listitem").count();
  expect(afterFilter).toBeLessThanOrEqual(totalCount);

  await expect(page.getByRole("link", { name: "Donate now" })).toHaveAttribute("href", "/donate");
});
