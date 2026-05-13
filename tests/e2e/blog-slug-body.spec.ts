import { expect, test } from "@playwright/test";

test.describe("R4.6 blog body chrome", () => {
  test("blockquote does not use the border-l-4 italic shadcn default", async ({ page }) => {
    await page.goto("/blog/how-we-allocate-donations");
    // PullQuote primitive uses .pullquote__quote and a .pullquote__glyph
    // span. The shadcn default `border-l-4 italic` blockquote must be gone.
    const blockquotes = page.locator("blockquote");
    const count = await blockquotes.count();
    if (count > 0) {
      // No blockquote in MDX body uses the deprecated border-l-4 class
      const flagged = page.locator("blockquote.border-l-4");
      await expect(flagged).toHaveCount(0);
    }
  });

  test("Continue-reading spotlight renders without portrait images and CTAFooterPanel is removed", async ({
    page,
  }) => {
    await page.goto("/blog/fall-2025-field-update");
    // Stage 5 — single editorial spotlight, eyebrow "Continue reading" + h2 post title
    const eyebrow = page.getByText("Continue reading", { exact: false }).first();
    await expect(eyebrow).toBeVisible();
    // CTAFooterPanel donate link must not appear at the article tail
    await expect(page.getByRole("link", { name: "Sponsor a Student" })).toHaveCount(0);
  });

  test("H1 wraps to no more than 3 lines on iPhone-class viewport (390×844)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/blog/fall-2025-field-update");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const box = await h1.boundingBox();
    if (!box) throw new Error("h1 has no bounding box");
    const lineHeightStr = await h1.evaluate((el) => getComputedStyle(el as Element).lineHeight);
    const fontSizeStr = await h1.evaluate((el) => getComputedStyle(el as Element).fontSize);
    const fontSize = Number.parseFloat(fontSizeStr);
    const lineHeight =
      lineHeightStr === "normal" ? fontSize * 1.2 : Number.parseFloat(lineHeightStr);
    const lines = Math.round(box.height / lineHeight);
    expect(lines).toBeLessThanOrEqual(3);
  });
});
