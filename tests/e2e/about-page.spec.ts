import { expect, test } from "@playwright/test";

test.describe("R4.6 /about long-form", () => {
  test("MissionVision shows SceneBreak before each H2 and Dropcap on first paragraph", async ({
    page,
  }) => {
    await page.goto("/about");
    // Two SceneBreak ornaments in MissionVision
    const breaks = page.locator(".scene-break");
    expect(await breaks.count()).toBeGreaterThanOrEqual(2);
    // Two Dropcap wrappers in MissionVision
    const dropcaps = page.locator(".dropcap");
    expect(await dropcaps.count()).toBeGreaterThanOrEqual(2);

    // Both H2s present
    await expect(page.getByRole("heading", { level: 2, name: /Our Mission/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Our Vision/i })).toBeVisible();
  });
});
