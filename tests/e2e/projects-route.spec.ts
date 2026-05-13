import { expect, test } from "@playwright/test";

test("projects route renders hero, active/paused list, funded recap, and CTA", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our projects.");

  const progressbars = page.getByRole("progressbar");
  await expect(progressbars.first()).toBeVisible();
  const barCount = await progressbars.count();
  expect(barCount).toBeGreaterThan(0);
  for (let i = 0; i < barCount; i += 1) {
    const bar = progressbars.nth(i);
    await expect(bar).toHaveAttribute("aria-valuenow", /^\d+$/);
  }

  await expect(page.getByRole("heading", { name: "Fully funded — thank you" })).toBeVisible();

  await expect(page.getByRole("link", { name: "Donate now" })).toHaveAttribute("href", "/donate");
});
