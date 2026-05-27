import { expect, test } from "@playwright/test";

// Route-smoke tests for the multi-role auth rollout. These don't try to
// simulate full Clerk sign-in (that requires real test users + email OTP
// in the case of admin); they just verify each new public-facing route
// renders without crashing and surfaces the key content.

test.describe("/login-roles hub", () => {
  test("hub renders 10 role cards with eyebrow + label + blurb", async ({ page }) => {
    await page.goto("/login-roles");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Pick how you're joining us/i,
    );
    // Six live roles
    for (const label of ["Donor", "Student", "Mentor", "Admin", "Accounting", "Media"]) {
      await expect(page.getByRole("link", { name: new RegExp(label, "i") })).toBeVisible();
    }
    // Four placeholder roles
    for (const label of ["Lead", "IT Team", "Project Management", "Communication"]) {
      await expect(page.getByText(label, { exact: false })).toBeVisible();
    }
  });
});

test.describe("/login-roles/[role] per-role landing", () => {
  test("live role shows Sign in + Create account panels", async ({ page }) => {
    await page.goto("/login-roles/donor");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Donor/i);
    await expect(page.getByRole("link", { name: /^Sign in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Create account/i })).toBeVisible();
  });

  test("placeholder role shows Coming soon panel, no sign-in/create-account", async ({ page }) => {
    await page.goto("/login-roles/lead");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Lead/i);
    // "Coming soon" appears in eyebrow + body
    await expect(page.getByText(/coming soon/i).first()).toBeVisible();
    // No live action panels
    await expect(page.getByRole("link", { name: /^Sign in/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Create account/i })).toHaveCount(0);
  });

  test("unknown role slug 404s", async ({ page }) => {
    const response = await page.goto("/login-roles/not-a-real-role");
    expect(response?.status()).toBe(404);
  });
});

test.describe("Pending-approval page", () => {
  // The page reads the user's status. Without an authenticated session
  // we get bounced to /sign-in, so this test just confirms the redirect
  // path is intact — it doesn't render any pending UI.
  test("unauthenticated visitor bounces to /sign-in", async ({ page }) => {
    await page.goto("/pending-approval");
    // We either land on /sign-in directly or on a Clerk hosted-account
    // page — both are acceptable "you must sign in first" outcomes.
    const url = page.url();
    expect(url.includes("/sign-in") || url.includes("clerk")).toBeTruthy();
  });
});

test.describe("New role signup entry routes are reachable", () => {
  test("/accountant-signup renders (Clerk hosted form OR preview panel)", async ({ page }) => {
    await page.goto("/accountant-signup");
    // Either the real Clerk form (h1 = "Join as an accountant.") or the
    // preview-mode setup panel ("Accountant sign-up is being configured.")
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/accountant/i);
  });

  test("/media-signup renders", async ({ page }) => {
    await page.goto("/media-signup");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/media/i);
  });
});

test.describe("Cookie consent banner", () => {
  test("appears on first visit, hides after Got it", async ({ page, context }) => {
    // Clear any prior localStorage from other tests in this worker
    await context.clearCookies();
    await page.goto("/");
    const banner = page.getByRole("dialog", { name: /cookie notice/i });
    await expect(banner).toBeVisible({ timeout: 5000 });
    await banner.getByRole("button", { name: /got it/i }).click();
    await expect(banner).toBeHidden();
    // Reload — banner stays gone because of localStorage
    await page.reload();
    await expect(banner).toBeHidden();
  });
});
