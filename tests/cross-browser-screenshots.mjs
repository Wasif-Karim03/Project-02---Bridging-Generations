// One-off Firefox + WebKit screenshot pass on the donor-funnel routes.
// Not part of the default Playwright suite — run directly:
//   node tests/cross-browser-screenshots.mjs
// Outputs to /tmp/xb-<browser>-<route>.png

import { mkdir } from "node:fs/promises";
import { chromium, firefox, webkit } from "@playwright/test";

const ROUTES = ["/", "/donate", "/students"];
const BASE = "http://localhost:3001";
const OUT = "/tmp/xb";

await mkdir(OUT, { recursive: true });

const browsers = { firefox, webkit, chromium };

for (const [name, launcher] of Object.entries(browsers)) {
  const browser = await launcher.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
  });
  // Don't let the Givebutter widget host fail the screenshot.
  await ctx.route(/widgets\.givebutter\.com/, (r) => r.abort());
  const page = await ctx.newPage();

  for (const route of ROUTES) {
    const safe = route.replace(/\//g, "_") || "_root";
    const file = `${OUT}/${name}${safe}.png`;
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded", timeout: 25_000 });
      // Reveal observers + develop filter latch ~900ms after is-visible. Scroll to
      // bottom slowly so each Reveal section fires, then wait for paint.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 250));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 1500));
      });
      try {
        await page.screenshot({ path: file, fullPage: true, timeout: 30_000 });
      } catch {
        // WebKit /students hangs on document.fonts.ready — force-resolve it
        // so Playwright's font-wait completes and the screenshot fires.
        await page.evaluate(() => {
          Object.defineProperty(document, "fonts", {
            value: { ready: Promise.resolve(), status: "loaded", check: () => true },
            configurable: true,
          });
        });
        await page.screenshot({ path: file, fullPage: true, timeout: 15_000 });
        console.log(`${name} ${route} -> ${file} (fonts-ready forced)`);
        continue;
      }
      console.log(`${name} ${route} -> ${file}`);
    } catch (err) {
      console.log(`${name} ${route} FAILED: ${err.message}`);
    }
  }

  await browser.close();
}
