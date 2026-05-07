import { expect, test } from "@playwright/test";

const grainHref = /paper-grain\.svg|feTurbulence/;

test("cream sections compute a paper-grain background image", async ({ page }) => {
  await page.goto("/");

  // hero is bg-ground; mission is bg-ground-3; activities is bg-ground-2 — sample one of each tier.
  const samples = [
    { selector: "#hero", tier: "ground" },
    { selector: "#mission", tier: "ground-3" },
    { selector: "#activities", tier: "ground-2" },
  ];

  for (const { selector, tier } of samples) {
    const bgImage = await page.locator(selector).evaluate((el) => {
      return getComputedStyle(el).backgroundImage;
    });
    expect(bgImage, `${tier} section ${selector} should reference paper-grain.svg`).toMatch(
      grainHref,
    );
  }
});

test("teal panels do NOT layer the cream paper grain on top of their own noise", async ({
  page,
}) => {
  await page.goto("/");
  // The .teal-panel section's own background-image is none (its grain lives on .teal-panel::before).
  const bgImage = await page.locator("#testimonial").evaluate((el) => {
    return getComputedStyle(el).backgroundImage;
  });
  expect(bgImage).not.toMatch(grainHref);
});

test("paper-grain.svg is reachable at the published path", async ({ request }) => {
  const res = await request.get("/textures/paper-grain.svg");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain("feTurbulence");
  expect(body).toContain('stitchTiles="stitch"');
});
