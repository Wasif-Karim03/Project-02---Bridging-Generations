import { expect, test } from "@playwright/test";

test("blog slug route renders header, MDX body, marginalia rail, author byline, and Read next rail", async ({
  page,
}) => {
  await page.goto("/blog/fall-2025-field-update");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Fall 2025 — what a full year of meals looked like",
  );

  // MDX h2 from the post body
  await expect(page.getByRole("heading", { name: "What changed" })).toBeVisible();

  // R4.6 — marginalia rail mounts read-time + dateline + author + share
  await expect(page.getByRole("complementary", { name: "Article metadata" })).toBeVisible();

  // Author byline credit at end of article
  const byline = page.getByRole("complementary", { name: "About the author" });
  await expect(byline).toBeVisible();
  await expect(byline.getByText("Priya Ahmed")).toBeVisible();

  // R4.6 (Stage 5) renames the rail to a single "Continue reading" spotlight
  // and removes the donate CTA from this route
  await expect(page.getByText("Continue reading", { exact: false }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sponsor a Student" })).toHaveCount(0);
});

test("unknown blog slug renders 404", async ({ page }) => {
  const response = await page.goto("/blog/does-not-exist");
  expect(response?.status()).toBe(404);
});
