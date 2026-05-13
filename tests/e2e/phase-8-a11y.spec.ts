import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const ROUTES = ["/donate", "/donate/thank-you", "/contact", "/terms"] as const;

test.beforeEach(async ({ page }) => {
  // Block the external Givebutter widget so the a11y run does not depend on a third-party CDN.
  await page.route(/widgets\.givebutter\.com/, (route) => route.abort());
});

for (const route of ROUTES) {
  test(`${route} has zero axe violations under reduced motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test(`${route} has zero axe violations under full motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route);
    await page.waitForTimeout(1200);
    const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("/donate renders the donate surface and FAQ toggles without JS", async ({ page }) => {
  await page.goto("/donate");
  // The donate surface is either the Givebutter widget (when real credentials
  // are wired) or the setup fallback CTA (when the campaign id is a placeholder
  // — current state as of PRs #82, #83). Accept either.
  const donateSurface = page
    .locator("main givebutter-widget, main a[href^='mailto:info@bridginggenerations.org']")
    .first();
  await expect(donateSurface).toBeVisible();

  const firstSummary = page.locator("details summary").first();
  await firstSummary.click();
  const firstDetails = page.locator("details").first();
  await expect(firstDetails).toHaveAttribute("open", "");
});

test("/donate?project=<unknown> still renders cleanly", async ({ page }) => {
  await page.goto("/donate?project=does-not-exist");
  await expect(page.locator("h1")).toBeVisible();
});

test("/contact valid submission shows the success state", async ({ page }) => {
  await page.goto("/contact");
  await page.fill('input[name="name"]', "Test Name");
  await page.fill('input[name="email"]', "test@example.com");
  await page.fill('textarea[name="message"]', "A real looking message.");
  await page.click('button[type="submit"]');
  await expect(page.getByRole("status")).toBeVisible({ timeout: 15000 });
});

test("/contact honeypot input is aria-hidden from assistive tech", async ({ page }) => {
  await page.goto("/contact");
  const honeypot = page.locator("#contact-company");
  await expect(honeypot).toHaveCount(1);
  const wrapper = honeypot.locator("xpath=ancestor::div[@aria-hidden='true']").first();
  await expect(wrapper).toHaveCount(1);
});

test("/contact flags invalid email with a field error", async ({ page }) => {
  await page.goto("/contact");
  await page.fill('input[name="name"]', "Name");
  await page.fill('input[name="email"]', "not-an-email");
  await page.fill('textarea[name="message"]', "Body");
  await page.click('button[type="submit"]');
  await expect(page.getByRole("alert").first()).toBeVisible({ timeout: 15000 });
});

test("/donate/thank-you is served as noindex", async ({ page }) => {
  const response = await page.goto("/donate/thank-you");
  expect(response?.status()).toBe(200);
  const meta = await page.locator('meta[name="robots"]').getAttribute("content");
  expect(meta?.toLowerCase()).toContain("noindex");
});

test("/terms renders the MDX body with semantic headings", async ({ page }) => {
  await page.goto("/terms");
  const h2s = page.locator("main h2");
  const count = await h2s.count();
  expect(count).toBeGreaterThanOrEqual(3);
});
