import { expect, test } from "@playwright/test";

test("students route renders hero, consent note, per-school sections, and CTA", async ({
  page,
}) => {
  await page.goto("/students");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Student Directory");

  await expect(page.getByRole("heading", { name: "A note on photos" })).toBeVisible();

  const schoolHeadings = page.getByRole("heading", { level: 2 });
  await expect(schoolHeadings.first()).toBeVisible();
  const count = await schoolHeadings.count();
  expect(count).toBeGreaterThan(1);

  await expect(page.getByRole("link", { name: "Sponsor a Student" })).toHaveAttribute(
    "href",
    "/donate",
  );
});
