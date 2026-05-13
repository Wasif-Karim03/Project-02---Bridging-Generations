import { expect, test } from "@playwright/test";

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

async function readDurations(page: import("@playwright/test").Page) {
  return await page.evaluate(() => {
    const all = [...document.querySelectorAll(".reveal-on-scroll")];
    const def = all.find(
      (el) => !(el as HTMLElement).dataset.revealKind && !el.hasAttribute("data-reveal-cascade"),
    );
    const dev = all.find((el) => (el as HTMLElement).dataset.revealKind === "develop");
    return {
      innerWidth: window.innerWidth,
      matchesMobile: window.matchMedia("(max-width: 767px)").matches,
      motionLg: getComputedStyle(document.documentElement).getPropertyValue("--motion-lg").trim(),
      defaultDuration: def ? getComputedStyle(def).transitionDuration : null,
      developDuration: dev ? getComputedStyle(dev).transitionDuration : null,
    };
  });
}

test("desktop Reveal transition-duration is 700ms (default) / 900ms (develop) at 1280px", async ({
  page,
}) => {
  await page.setViewportSize(DESKTOP);
  await page.goto("/");
  const r = await readDurations(page);
  expect(r.innerWidth, "viewport").toBe(DESKTOP.width);
  expect(r.matchesMobile, "matchMedia").toBe(false);
  expect(r.motionLg, "--motion-lg").toMatch(/^(\.7s|0\.7s|700ms)$/);
  expect(r.defaultDuration, "default reveal — found a default Reveal on /").not.toBeNull();
  expect(r.defaultDuration).toMatch(/0\.7s/);
  expect(r.developDuration, "develop reveal — found a develop Reveal on /").not.toBeNull();
  expect(r.developDuration).toMatch(/0\.9s/);
});

test("mobile Reveal transition-duration drops to 560ms (default) / 720ms (develop) at 375px", async ({
  page,
}) => {
  // Set viewport BEFORE navigation so the initial CSS evaluation matches mobile.
  await page.setViewportSize(MOBILE);
  await page.goto("/");
  const r = await readDurations(page);
  expect(r.innerWidth, "viewport").toBe(MOBILE.width);
  expect(r.matchesMobile, "matchMedia").toBe(true);
  expect(r.motionLg, "--motion-lg").toMatch(/^(\.56s|0\.56s|560ms)$/);
  expect(r.defaultDuration, "default reveal — found a default Reveal on /").not.toBeNull();
  expect(r.defaultDuration).toMatch(/0\.56s/);
  expect(r.developDuration, "develop reveal — found a develop Reveal on /").not.toBeNull();
  expect(r.developDuration).toMatch(/0\.72s/);
});
