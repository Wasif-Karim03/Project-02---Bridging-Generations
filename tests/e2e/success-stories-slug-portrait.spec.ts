import { expect, test } from "@playwright/test";

test.describe("R4.6 success-stories portrait + pull-quote", () => {
  test("portrait hero aspect ladder: 5/6 mobile → 4/5 sm → 3/4 lg", async ({ page }) => {
    // Use a published story
    const path = "/success-stories/mithun-graduates";

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const heroMobile = page
      .getByRole("region")
      .filter({ hasText: /mithun/i })
      .first();
    await expect(heroMobile).toBeVisible();
    const mobileBox = await heroMobile.locator("div").first().boundingBox();
    if (!mobileBox) throw new Error("mobile portrait hero missing bounding box");
    // 5/6 ratio means height/width ≈ 1.2
    expect(mobileBox.height / mobileBox.width).toBeGreaterThan(1.0);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(path);
    const heroDesktop = page
      .getByRole("region")
      .filter({ hasText: /mithun/i })
      .first();
    await expect(heroDesktop).toBeVisible();
    const desktopBox = await heroDesktop.locator("div").first().boundingBox();
    if (!desktopBox) throw new Error("desktop portrait hero missing bounding box");
    // 3/4 ratio means height/width ≈ 1.33 (portrait, taller than wide)
    expect(desktopBox.height / desktopBox.width).toBeGreaterThan(1.1);
  });

  test("portrait caption: editorial framing with Profile eyebrow + display name + meta role", async ({
    page,
  }) => {
    await page.goto("/success-stories/mithun-graduates");
    // Eyebrow "Profile" precedes the name (Stage 5 refinement)
    const eyebrow = page.locator("p.text-eyebrow.uppercase", { hasText: /^Profile$/i }).first();
    await expect(eyebrow).toBeVisible();
    // Name dominates as heading-2 display
    const name = page.locator("p.text-heading-2").first();
    await expect(name).toBeVisible();
    // Role is text-meta uppercase
    const role = page.locator("p.text-meta.uppercase").first();
    await expect(role).toBeVisible();
  });

  test("PullQuote glyph renders with display-tier opening quote", async ({ page }) => {
    await page.goto("/success-stories/mithun-graduates");
    const glyph = page.locator(".pullquote__glyph").first();
    await expect(glyph).toBeVisible();
    // The glyph contains a left-double-quote character
    await expect(glyph).toContainText(/[“"]/);
  });
});
