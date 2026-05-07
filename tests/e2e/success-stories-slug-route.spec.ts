import { expect, test } from "@playwright/test";

test("success story slug route renders hero, pull-quote, MDX body, marginalia rail, and Read next", async ({
  page,
}) => {
  await page.goto("/success-stories/priya-university-dhaka");

  // h1 is visually hidden but exists for screen readers
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Priya.*Success story/);

  // Pull-quote renders in a blockquote inside a figure (R4.6 PullQuote primitive)
  await expect(page.getByRole("blockquote").first()).toBeVisible();
  await expect(page.locator(".pullquote__glyph").first()).toBeVisible();

  // R4.6 — marginalia rail mounts read-time + dateline + share
  await expect(page.getByRole("complementary", { name: "Article metadata" })).toBeVisible();

  // R4.6 (Stage 5) renames the rail to a single "Continue reading" spotlight
  // and removes the donate CTA from this route
  await expect(page.getByText("Continue reading", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Donate now" })).toHaveCount(0);
});

test("unknown success story slug renders 404", async ({ page }) => {
  const response = await page.goto("/success-stories/does-not-exist");
  expect(response?.status()).toBe(404);
});
