import { expect, test } from "@playwright/test";

// Smoke tests for Firefox + WebKit. Tagged @cross-browser so the playwright
// config runs them on FF/webkit while keeping the chromium project unchanged.
// Goal: catch broken renders + console errors on the three critical donor-funnel
// routes — not full feature parity.

const ROUTES = ["/", "/donate", "/students"] as const;

for (const route of ROUTES) {
  test(`${route} renders without console errors @cross-browser`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    // Block Givebutter so /donate doesn't fail on third-party load.
    await page.route(/widgets\.givebutter\.com/, (r) => r.abort());

    // domcontentloaded (not "load") — Turbopack dev keeps an HMR EventSource
    // open and "load" never resolves under WebKit. Production builds settle
    // normally; this just keeps the smoke spec usable in dev.
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    // Filter benign expected noise:
    // - third-party blocks (Givebutter route blocked above)
    // - dev HMR connection chatter
    // - Firefox's CSP-report-only rate-limit warning
    // - WebKit's "frame-ancestors ignored in report-only" warning (spec quirk)
    // All CSP noise disappears when Phase 12.5 flips CSP from report-only to enforce.
    const real = errors.filter(
      (e) =>
        !e.match(/widgets\.givebutter\.com/i) &&
        !e.match(/Failed to load resource/i) &&
        !e.match(/HMR|Hot module/i) &&
        !e.match(/Content-Security-Policy.*reports/i) &&
        !e.match(/frame-ancestors.*report-only/i),
    );
    expect(real, `unexpected console errors on ${route}: ${real.join(" | ")}`).toEqual([]);
  });
}

test("home hero LCP image renders @cross-browser", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const heroImg = page.locator('img[src*="home-hero"]').first();
  await expect(heroImg).toBeVisible();
});
