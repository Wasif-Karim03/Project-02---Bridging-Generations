import { expect, test } from "@playwright/test";

test("FilterChips wrap cleanly at 320 — no horizontal overflow on the fieldset", async ({
  page,
}) => {
  // R3.1 audit decision: at 320px, the 6 activity chips wrap to 3 rows of 2
  // and read cleanly. A horizontal-scroll utility was considered and dropped —
  // off-right chips with no affordance harm discoverability more than vertical
  // wrap costs in scroll height. This spec locks in the wrap-doesn't-overflow
  // contract; if a longer label or layout change pushes the fieldset wider than
  // its parent, escalate to the scroll-snap utility from the original R3.1 plan.
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/activities");
  const fieldset = page.getByRole("group", { name: /filter activities/i });
  await expect(fieldset).toBeVisible();
  const overflow = await fieldset.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
});
