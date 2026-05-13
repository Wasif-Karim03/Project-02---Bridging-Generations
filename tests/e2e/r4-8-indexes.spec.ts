import { expect, test } from "@playwright/test";

// R4.8 — editorial indexes + recognition pages. Stage 3 verification of the
// eight routes touched by Stage 2 plus the new /students/[slug] route.

test.describe("/students", () => {
  test("renders the directory with school + status filter chips", async ({ page }) => {
    await page.goto("/students");
    await expect(page.getByRole("heading", { name: /browse the directory/i })).toBeVisible();
    const schoolChips = page.getByRole("group", { name: /filter by school/i }).getByRole("button");
    await expect(schoolChips.first()).toBeVisible();
    const statusChips = page
      .getByRole("group", { name: /filter by sponsorship status/i })
      .getByRole("button");
    await expect(statusChips.first()).toBeVisible();
  });

  test("every status chip carries a count, not just All", async ({ page }) => {
    await page.goto("/students");
    const statusChips = page
      .getByRole("group", { name: /filter by sponsorship status/i })
      .getByRole("button");
    const labels = await statusChips.allTextContents();
    for (const label of labels) {
      expect(label).toMatch(/\(\d+\)/);
    }
  });
});

test.describe("/students/[slug]", () => {
  test("first directory link resolves and renders the profile", async ({ page }) => {
    await page.goto("/students");
    const firstStudentLink = page.locator("section[aria-label='Student directory'] a").first();
    await expect(firstStudentLink).toBeVisible();
    const href = await firstStudentLink.getAttribute("href");
    expect(href).toMatch(/^\/students\//);
    await firstStudentLink.click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /back to directory/i })).toBeVisible();
  });
});

test.describe("/donors", () => {
  test("renders the museum-wall caption and at least one tier or year heading", async ({
    page,
  }) => {
    await page.goto("/donors");
    const wall = page.locator("section[aria-label='Anonymous thank-you wall']");
    await expect(wall).toBeVisible();
    await expect(wall).toContainText(/202\d/);
  });
});

test.describe("/testimonials", () => {
  test("hero stamp surfaces only the roles present in the data", async ({ page }) => {
    await page.goto("/testimonials");
    const heroStamp = page.locator("section[aria-labelledby='testimonials-hero-title'] ul").last();
    await expect(heroStamp).toBeVisible();
    // Must include the leading count.
    await expect(heroStamp).toContainText(/voice|voices/);
  });
});

test.describe("/success-stories", () => {
  test("featured story headline derives from subjectName, not pull quote", async ({ page }) => {
    await page.goto("/success-stories");
    const featured = page.locator("section[aria-label='All success stories'] article").first();
    await expect(featured).toBeVisible();
    const heading = featured.getByRole("heading").first();
    await expect(heading).toContainText(/'s story|’s story/);
  });
});

test.describe("/gallery", () => {
  test("captions are visible at rest", async ({ page }) => {
    await page.goto("/gallery");
    const firstCaption = page.locator("figcaption").first();
    await expect(firstCaption).toBeVisible();
  });

  test("clicking a thumbnail opens the lightbox dialog", async ({ page }) => {
    await page.goto("/gallery");
    const firstThumb = page
      .locator("section[aria-label='Photograph grid'] button[aria-label*='Open']")
      .first();
    await firstThumb.click();
    const dialog = page.locator("dialog[open]");
    await expect(dialog).toBeVisible();
    // ESC closes it (native cancel event).
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog[open]")).toHaveCount(0);
  });
});

test.describe("/projects", () => {
  test("renders project list with at least one ribbon status", async ({ page }) => {
    await page.goto("/projects");
    const list = page.locator("section[aria-label='Active and paused projects']");
    await expect(list).toBeVisible();
    const ribbons = list.locator(".program-ribbon");
    await expect(ribbons.first()).toBeVisible();
  });
});

test.describe("/blog", () => {
  test("hero stamp drops the false-taxonomy promise", async ({ page }) => {
    await page.goto("/blog");
    const heroStamp = page.locator("section[aria-labelledby='blog-hero-title'] ul").last();
    await expect(heroStamp).not.toContainText(/field updates/i);
    await expect(heroStamp).not.toContainText(/transparency notes/i);
  });
});

test.describe("/activities", () => {
  test("renders an ordered timeline list, not a <ul>", async ({ page }) => {
    await page.goto("/activities");
    await expect(page.locator("ol[aria-label='Recent activities timeline']")).toBeVisible();
  });

  test("filter chips show counts on every chip", async ({ page }) => {
    await page.goto("/activities");
    const chips = page
      .getByRole("group", { name: /filter activities by type/i })
      .getByRole("button");
    const labels = await chips.allTextContents();
    for (const label of labels) {
      expect(label).toMatch(/\(\d+\)/);
    }
  });
});
