import { expect, test } from "@playwright/test";

// R4.7 — conversion-boundary surfaces. Stage 3 verification of the four routes
// touched by Stages 1 + 2: /donate, /donate/thank-you, /contact, /404.

test.describe("/donate", () => {
  test("transaction-source gate: shows fallback copy and hides Givebutter promise", async ({
    page,
  }) => {
    await page.goto("/donate");
    const main = page.getByRole("main");
    // YAML transactionSource: placeholder → fallback copy renders.
    await expect(main).toContainText("standing up the Givebutter campaign");
    // Givebutter receipt-promise must NOT appear when not in givebutter mode.
    await expect(main).not.toContainText("Givebutter emails your tax-deductible receipt");
  });

  test("DonateTrustStrip is visible with 501(c)(3) row", async ({ page }) => {
    await page.goto("/donate");
    const trustSection = page.locator('section[aria-labelledby="donate-trust-title"]');
    await expect(trustSection).toBeVisible();
    const dl = trustSection.locator("dl");
    await expect(dl).toBeVisible();
    await expect(
      dl
        .locator("dd")
        .filter({ hasText: /501\(c\)\(3\)/ })
        .first(),
    ).toBeVisible();
  });

  test("transactionSource note shows above FAQ when not Givebutter", async ({ page }) => {
    await page.goto("/donate");
    const faqSection = page.locator('section[aria-labelledby="donate-faq-title"]');
    await expect(faqSection).toContainText("describe how giving works through Givebutter");
  });

  test("mobile CTA bar mounts on small viewports", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/donate");
    // Section is in DOM; visibility (aria-hidden) depends on scroll. Smoke check only.
    const ctaBar = page.locator('section[aria-label="Donate"]');
    await expect(ctaBar).toHaveCount(1);
  });
});

test.describe("/donate/thank-you", () => {
  test("no-context default renders hero without personalization", async ({ page }) => {
    await page.goto("/donate/thank-you");
    await expect(
      page.getByRole("heading", { level: 1, name: /Your support changes a child's year\./ }),
    ).toBeVisible();
    await expect(page.locator('[data-testid="thank-you-personalization"]')).toHaveCount(0);
  });

  test("URL-param personalization renders firstName, amount, and designation copy", async ({
    page,
  }) => {
    await page.goto("/donate/thank-you?amount=30&designation=meals&firstName=Alex");
    const personalization = page.locator('[data-testid="thank-you-personalization"]');
    await expect(personalization).toBeVisible();
    await expect(personalization).toContainText("Alex");
    await expect(personalization).toContainText("$30");
    await expect(personalization).toContainText("daily meals");
  });

  test("allow-list rejection: invalid designation drops only the designation copy, sanitizes XSS", async ({
    page,
  }) => {
    // designation 'trojan' is not in the allow-list — falls back to generic copy.
    // amount + firstName are valid, so personalization still renders.
    await page.goto("/donate/thank-you?amount=30&designation=trojan&firstName=Bobby");
    const personalization = page.locator('[data-testid="thank-you-personalization"]');
    await expect(personalization).toBeVisible();
    await expect(personalization).toContainText("Bobby");
    await expect(personalization).toContainText("$30");
    // No designation-specific phrase — the generic fallback runs instead.
    await expect(personalization).not.toContainText("daily meals");
    await expect(personalization).not.toContainText("tuition for one student");
    await expect(personalization).toContainText("keeps a student in the classroom");

    // Separate XSS check: a script-tag firstName fails the name regex and is
    // dropped entirely, so the rendered HTML never contains <script>.
    await page.goto("/donate/thank-you?firstName=%3Cscript%3Ealert(1)%3C%2Fscript%3E");
    const html = await page.content();
    expect(html).not.toContain("<script>alert(1)</script>");
  });

  test("subscribe form posts to contact action with audience=subscriber", async ({ page }) => {
    await page.goto("/donate/thank-you");
    const hidden = page.locator('input[type="hidden"][name="audience"][value="subscriber"]');
    await expect(hidden).toHaveCount(1);
  });

  test("read-next tile links to a /success-stories/ route", async ({ page }) => {
    await page.goto("/donate/thank-you");
    const readNext = page.locator('section[aria-labelledby="thank-you-readnext-title"]');
    await expect(readNext).toBeVisible();
    const storyLinks = readNext.locator('a[href^="/success-stories/"]');
    expect(await storyLinks.count()).toBeGreaterThanOrEqual(1);
  });
});

test.describe("/contact", () => {
  test("AudienceTriage renders fieldset with 4 audience radios", async ({ page }) => {
    await page.goto("/contact");
    const fieldset = page
      .locator("fieldset")
      .filter({ has: page.locator("legend", { hasText: /I'm a/ }) });
    await expect(fieldset).toBeVisible();
    await expect(fieldset.locator("legend")).toHaveText("I'm a…");

    for (const value of ["donor", "partner", "journalist", "parent"]) {
      await expect(
        fieldset.locator(`input[type="radio"][name="audience"][value="${value}"]`),
      ).toHaveCount(1);
    }
  });

  test("privacy band section is removed (folded into form microcopy)", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator('section[aria-labelledby="contact-privacy-title"]')).toHaveCount(0);
  });

  test("privacy microcopy lives next to submit inside the form", async ({ page }) => {
    await page.goto("/contact");
    const form = page
      .locator("form")
      .filter({ has: page.locator('button[type="submit"]') })
      .first();
    await expect(form).toContainText("We use your email only to reply");
  });

  test("mobile keyboard attributes on email input and message textarea", async ({ page }) => {
    await page.goto("/contact");
    const email = page.locator('input[name="email"]');
    await expect(email).toHaveAttribute("inputmode", "email");
    await expect(email).toHaveAttribute("autocapitalize", "off");

    const message = page.locator('textarea[name="message"]');
    await expect(message).toHaveAttribute("enterkeyhint", "send");
  });

  test("info card email anchor has mailto affordance (text-accent + underline)", async ({
    page,
  }) => {
    await page.goto("/contact");
    const info = page.getByRole("complementary", { name: /Direct contact details/i });
    const emailLink = info.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();
    const cls = (await emailLink.getAttribute("class")) ?? "";
    expect(cls).toContain("text-accent");
    expect(cls).toContain("underline");
  });
});

test.describe("/404", () => {
  test("Hill Tracts editorial line is the H1", async ({ page }) => {
    await page.goto("/some-route-that-does-not-exist");
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
    const text = (await h1.textContent()) ?? "";
    expect(text).toContain("Hill Tracts");
    expect(text).toContain("not on this server");
  });

  test("three named recovery destinations with heading-style class", async ({ page }) => {
    await page.goto("/some-route-that-does-not-exist");
    const dests = page.getByRole("navigation", { name: /Standing destinations/i });
    await expect(dests).toBeVisible();

    for (const href of ["/success-stories", "/activities", "/donate"]) {
      const link = dests.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      const cls = (await link.getAttribute("class")) ?? "";
      expect(cls).toContain("text-heading-3");
    }
  });

  test("search stub: <search> with input[type=search] and aria-label", async ({ page }) => {
    await page.goto("/some-route-that-does-not-exist");
    const searchEl = page.locator("search");
    await expect(searchEl).toHaveCount(1);
    const input = searchEl.locator('input[type="search"][name="q"]');
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("aria-label", "Search the site");
  });

  test("no two-button row regression — pre-R4.7 'Meet our students' bg-accent-2 link is gone", async ({
    page,
  }) => {
    await page.goto("/some-route-that-does-not-exist");
    const main = page.getByRole("main");
    const oldButton = main.locator('a[class*="bg-accent-2"]', { hasText: "Meet our students" });
    await expect(oldButton).toHaveCount(0);
  });
});
