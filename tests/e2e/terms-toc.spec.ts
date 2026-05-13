import { expect, test } from "@playwright/test";

test.describe("R4.6 /terms TOC", () => {
  test("desktop renders sticky TOC in left gutter; clicking item scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/terms");
    const toc = page.locator(".toc-sticky");
    await expect(toc).toBeVisible();
    // Sticky position sets it above the body; ensure at least 3 H2 entries
    const items = toc.locator(".toc-sticky__item");
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Click the first item — page should scroll the corresponding heading into view
    const firstItem = items.first();
    const href = await firstItem.locator("a").getAttribute("href");
    expect(href).toMatch(/^#/);
    await firstItem.locator("a").click();
    // URL hash should now match
    await expect(page).toHaveURL(new RegExp(`${href}$`.replace("#", "#")));
  });

  test("mobile renders collapsible <details> with summary 'On this page'", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/terms");
    const details = page.locator(".toc-collapsible");
    await expect(details).toBeVisible();
    await expect(details.locator("summary")).toContainText("On this page");
    // Closed by default
    expect(await details.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
    // Click summary to open
    await details.locator("summary").click();
    expect(await details.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
    const items = details.locator(".toc-collapsible__item");
    expect(await items.count()).toBeGreaterThanOrEqual(3);
  });

  test("does not render duplicate 'Questions' H2", async ({ page }) => {
    await page.goto("/terms");
    const questionsH2s = page.getByRole("heading", { level: 2, name: /^questions$/i });
    expect(await questionsH2s.count()).toBeLessThanOrEqual(1);
  });
});
