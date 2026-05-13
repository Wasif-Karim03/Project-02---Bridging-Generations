import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("primary nav is keyboard reachable on desktop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const banner = page.getByRole("banner");
  await page.keyboard.press("Tab"); // skip link
  await page.keyboard.press("Tab"); // brand
  await expect(banner.getByRole("link", { name: "Bridging Generations" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(banner.getByRole("link", { name: "About" })).toBeFocused();
});

test("mobile menu opens, traps focus, and closes on escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hamburger = page.getByRole("button", { name: /open menu/i });
  await hamburger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  // Native <dialog>.showModal() is implicitly modal per WAI-ARIA; aria-modal is not required.

  const close = dialog.getByRole("button", { name: /close menu/i });
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(hamburger).toBeFocused();
});

test("opening the mobile menu locks page scroll (wheel input)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  // Anchor the page somewhere scrollable so we can detect wheel-driven movement.
  await page.evaluate(() => window.scrollTo(0, 300));
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBe(300);

  await page.getByRole("button", { name: /open menu/i }).click();

  // <html> is the scrolling element in standards mode; locking only body leaves
  // wheel input free. Both must read overflow:hidden.
  const overflows = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflow,
    body: getComputedStyle(document.body).overflow,
  }));
  expect(overflows.html).toBe("hidden");
  expect(overflows.body).toBe("hidden");

  // Programmatic scrollTo bypasses overflow; wheel events do not.
  await page.evaluate(() =>
    document.documentElement.dispatchEvent(
      new WheelEvent("wheel", { deltaY: 400, bubbles: true, cancelable: true }),
    ),
  );
  const after = await page.evaluate(() => window.scrollY);
  expect(after, "scroll position must not change while menu is open").toBe(before);

  await page.keyboard.press("Escape");
  const restored = await page.evaluate(() => ({
    html: getComputedStyle(document.documentElement).overflow,
    body: getComputedStyle(document.body).overflow,
  }));
  expect(restored.html).not.toBe("hidden");
  expect(restored.body).not.toBe("hidden");
});

test("home route has zero axe violations with nav mounted", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});
