import { expect, test } from "@playwright/test";

test("design route is noindexed via meta and header", async ({ page, request }) => {
  const res = await request.get("/design");
  expect(res.status()).toBe(200);
  expect(res.headers()["x-robots-tag"]).toContain("noindex");

  await page.goto("/design");
  const robotsMeta = page.locator('meta[name="robots"]');
  await expect(robotsMeta).toHaveAttribute("content", /noindex/);
  await expect(page.getByRole("heading", { name: "Design System", level: 1 })).toBeVisible();
});

test("nested design paths keep the noindex header", async ({ request }) => {
  const res = await request.get("/design/anything");
  expect(res.headers()["x-robots-tag"]).toContain("noindex");
  expect(res.headers()["x-robots-tag"]).toContain("nofollow");
});

test("robots.txt disallows design and donate thank-you", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("Disallow: /design");
  expect(body).toContain("Disallow: /donate/thank-you");
});
