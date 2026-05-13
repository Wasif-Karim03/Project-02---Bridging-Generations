import { expect, test } from "@playwright/test";

test("success-stories route renders hero, story cards, and CTA", async ({ page }) => {
  await page.goto("/success-stories");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Success stories");

  // Headlines now derive from `${subjectName}'s story` (R4.8). Use the All
  // success stories section as the bound for the count to avoid catching the
  // back-to-directory or CTA links.
  const cards = page
    .locator("section[aria-label='All success stories']")
    .getByRole("link", { name: /'s story|’s story/ });
  const count = await cards.count();
  expect(count).toBeGreaterThan(1);

  await expect(page.getByRole("link", { name: "Sponsor a Student" })).toHaveAttribute(
    "href",
    "/donate",
  );
});
