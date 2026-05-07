import { expect, test } from "@playwright/test";

test.describe("R4.9 motion vocabulary", () => {
  test("active-state motif renders on the aria-current link, not on inactive items", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/students");

    const active = page.getByRole("link", { name: "Students" }).first();
    await expect(active).toHaveAttribute("aria-current", "page");

    // The notch is rendered as a span.nav-active-motif inside the active link.
    const motif = active.locator(".nav-active-motif");
    await expect(motif).toHaveCount(1);

    // Inactive links must NOT carry the motif.
    const inactive = page.getByRole("link", { name: "About" }).first();
    await expect(inactive).not.toHaveAttribute("aria-current", "page");
    await expect(inactive.locator(".nav-active-motif")).toHaveCount(0);
  });

  test("SectionAct horizon hairline settles in once the section enters viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/blog/fall-2025-field-update");

    // Above the fold the hairline is at opacity 0 (waiting for IO).
    const initialOpacity = await page.evaluate(() => {
      const sa = document.querySelector("section.section-act");
      if (!sa) return null;
      return getComputedStyle(sa, "::before").opacity;
    });
    expect(
      initialOpacity,
      "section.section-act ::before must exist on /blog/[slug]",
    ).not.toBeNull();
    expect(initialOpacity).toBe("0");

    // Scroll into view and wait past the 400ms (--motion-md) transition + buffer.
    await page.evaluate(() => {
      document.querySelector("section.section-act")?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    });
    await page.waitForTimeout(700);

    const settled = await page.evaluate(() => {
      const sa = document.querySelector("section.section-act");
      if (!sa) return null;
      const cs = getComputedStyle(sa, "::before");
      return {
        opacity: cs.opacity,
        isVisible: sa.classList.contains("is-visible"),
      };
    });
    expect(settled?.opacity).toBe("1");
    expect(settled?.isVisible).toBe(true);
  });

  test("SectionAct horizon respects prefers-reduced-motion (immediate, no transition)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/blog/fall-2025-field-update");

    const before = await page.evaluate(() => {
      const sa = document.querySelector("section.section-act");
      if (!sa) return null;
      const cs = getComputedStyle(sa, "::before");
      return {
        opacity: cs.opacity,
        transition: cs.transitionDuration,
      };
    });
    // Under reduced-motion the CSS short-circuits to opacity 1 + no transition,
    // regardless of whether the IO has fired yet.
    expect(before).not.toBeNull();
    expect(before?.opacity).toBe("1");
    expect(before?.transition).toBe("0s");
  });

  test("mobile drawer-sheet animation cancels under reduced-motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /open menu/i }).click();

    const panelAnimation = await page.evaluate(() => {
      const panel = document.getElementById("mobile-menu");
      if (!panel) return null;
      const cs = getComputedStyle(panel);
      return {
        animationName: cs.animationName,
        opacity: cs.opacity,
      };
    });
    expect(panelAnimation?.animationName).toBe("none");
    expect(panelAnimation?.opacity).toBe("1");
  });

  test("success-story portrait carries view-transition-name on both index and slug", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });

    await page.goto("/success-stories");
    const indexNamed = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[style*="view-transition-name"]')).map(
        (el) => (el as HTMLElement).style.viewTransitionName,
      ),
    );
    expect(
      indexNamed,
      "exactly one element on the index should carry the success-story-hero name (the featured story)",
    ).toEqual(["success-story-hero"]);

    await page.goto("/success-stories/mithun-graduates");
    const slugNamed = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[style*="view-transition-name"]')).map(
        (el) => (el as HTMLElement).style.viewTransitionName,
      ),
    );
    expect(slugNamed).toEqual(["success-story-hero"]);
  });
});
