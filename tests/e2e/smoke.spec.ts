import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("home loads with the Donate CTA above the fold", async ({ page }) => {
    await page.goto("/");
    const donateCta = page.getByRole("link", { name: /donate|sponsor/i }).first();
    await expect(donateCta).toBeVisible();
    const box = await donateCta.boundingBox();
    expect(box).not.toBeNull();
    const viewport = page.viewportSize();
    expect(box?.y).toBeLessThan(viewport?.height ?? 720);
  });

  test("/donate renders the Givebutter embed or fallback CTA", async ({ page }) => {
    await page.goto("/donate");
    const main = page.getByRole("main");
    const donateSurface = main
      .locator("givebutter-widget, a[href^='mailto:info@bridginggenerations.org']")
      .first();
    await expect(donateSurface).toBeVisible();
  });

  test("/contact form surfaces validation errors on empty submit", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: /^send$/i }).click();
    await expect(page.getByRole("alert").first()).toBeVisible();
  });

  test("chrome navigation reaches Home → About → Students → Donate → Contact", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const nav = page.getByRole("navigation", { name: "Primary" });
    const footer = page.getByRole("contentinfo");

    await nav.getByRole("link", { name: "About" }).click();
    await page.waitForURL(/\/about$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await nav.getByRole("link", { name: "Students" }).click();
    await page.waitForURL(/\/students$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await nav.getByRole("link", { name: "Donate" }).click();
    await page.waitForURL(/\/donate$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await footer.getByRole("link", { name: "Contact" }).first().click();
    await page.waitForURL(/\/contact$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/design loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/design");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(errors, `Console errors on /design:\n${errors.join("\n")}`).toEqual([]);
  });
});
