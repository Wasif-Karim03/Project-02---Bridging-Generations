import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/activities",
  "/blog",
  "/blog/fall-2025-field-update",
  "/contact",
  "/design",
  "/donate",
  "/donate/thank-you",
  "/donors",
  "/gallery",
  "/projects",
  "/students",
  "/students/anika",
  "/success-stories",
  "/success-stories/mithun-graduates",
  "/terms",
  "/testimonials",
  "/__notfound",
];

const CSP_VIOLATION_RX = /Refused to|Content Security Policy|violates? .*directive/i;
const IPHONE_17_PRO = { width: 402, height: 874 };
const DESKTOP = { width: 1440, height: 900 };

for (const route of ROUTES) {
  test(`no CSP violations on ${route} (desktop)`, async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    const violations: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (CSP_VIOLATION_RX.test(text)) violations.push(text);
    });
    page.on("pageerror", (err) => {
      if (CSP_VIOLATION_RX.test(err.message)) violations.push(err.message);
    });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(violations, `${route}:\n${violations.join("\n")}`).toEqual([]);
  });

  test(`no CSP violations on ${route} (mobile 402)`, async ({ page }) => {
    await page.setViewportSize(IPHONE_17_PRO);
    const violations: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      if (CSP_VIOLATION_RX.test(text)) violations.push(text);
    });
    page.on("pageerror", (err) => {
      if (CSP_VIOLATION_RX.test(err.message)) violations.push(err.message);
    });
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(violations, `${route}:\n${violations.join("\n")}`).toEqual([]);
  });
}
