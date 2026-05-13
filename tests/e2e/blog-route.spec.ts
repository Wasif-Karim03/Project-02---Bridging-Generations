import { expect, test } from "@playwright/test";

test("blog route renders hero, featured post, post grid, and CTA", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Our blog");

  // Featured Feature renders inside the "Featured blog post" section.
  await expect(page.locator("section[aria-label='Featured blog post']")).toBeVisible();

  const postLinks = page
    .locator("section[aria-label='Featured blog post'], section[aria-label='All blog posts']")
    .getByRole("link");
  const count = await postLinks.count();
  expect(count).toBeGreaterThan(0);

  await expect(page.getByRole("link", { name: "Donate now" })).toHaveAttribute("href", "/donate");
});
