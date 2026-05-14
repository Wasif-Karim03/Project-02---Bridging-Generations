import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";

// Footer is now an async server component (it calls getTranslations()). Tests
// must resolve the component before passing to React Testing Library's render.
// The next-intl mock in tests/setup.ts returns the actual English string for
// each translation key, so assertions still target the rendered EN copy.
async function renderFooter(props: Parameters<typeof Footer>[0] = {}) {
  // biome-ignore lint/suspicious/noExplicitAny: async server component returns a React element
  const element = (await Footer(props)) as any;
  return render(element);
}

describe("Footer", () => {
  it("renders the wordmark and the tagline prop", async () => {
    await renderFooter({ tagline: "Sponsoring 156 students across the Chittagong Hill Tracts." });
    expect(screen.getByText("Bridging Generations")).toBeInTheDocument();
    expect(
      screen.getByText(/Sponsoring 156 students across the Chittagong Hill Tracts/i),
    ).toBeInTheDocument();
  });

  it("renders the spec's 3-column headings: Head Office / About / Others", async () => {
    await renderFooter({ phoneNumber: "+8801898911452" });
    expect(screen.getByText("Head Office")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Others")).toBeInTheDocument();
  });

  it("renders phone number when provided", async () => {
    await renderFooter({ phoneNumber: "+8801898911452" });
    expect(screen.getByText("+8801898911452")).toBeInTheDocument();
  });

  it("renders both emails when secondaryEmail is supplied", async () => {
    await renderFooter({
      contactEmail: "bridginggeneration20@gmail.com",
      secondaryEmail: "info@bridginggenerations.org",
    });
    expect(screen.getByText("bridginggeneration20@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("info@bridginggenerations.org")).toBeInTheDocument();
  });

  it("renders the About-column links (About Us, Recent Activities, Success Stories, ...)", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "About Us" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "Recent Activities" })).toHaveAttribute(
      "href",
      "/activities",
    );
    expect(screen.getByRole("link", { name: "Success Stories" })).toHaveAttribute(
      "href",
      "/success-stories",
    );
  });

  it("renders the Others-column links (Terms and Conditions etc.)", async () => {
    await renderFooter();
    expect(screen.getByRole("link", { name: "Terms and Conditions" })).toHaveAttribute(
      "href",
      "/terms",
    );
  });

  it("renders the current year in the copyright line", async () => {
    await renderFooter();
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it("renders the bKash logo for the payment row", async () => {
    await renderFooter();
    expect(screen.getByAltText(/bKash payment/i)).toBeInTheDocument();
  });

  it("hides the trust line entirely when no real EIN is passed", async () => {
    await renderFooter();
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("hides the trust line when ein is the 00-0000000 placeholder", async () => {
    await renderFooter({ ein: "00-0000000" });
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("hides the trust line when ein is a [CONFIRM:...] stub", async () => {
    await renderFooter({ ein: "[CONFIRM: ein]" });
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("renders the EIN in the trust line when a real value is provided", async () => {
    await renderFooter({ ein: "12-3456789" });
    const trustLine = screen.getByText(/Tax-deductible/);
    expect(trustLine).toHaveTextContent("501(c)(3) · EIN 12-3456789 · Tax-deductible");
  });

  it("hides the mailing address when value is a [CONFIRM:...] stub", async () => {
    await renderFooter({ mailingAddress: "[CONFIRM: mailing address]" });
    expect(screen.queryByText(/CONFIRM/)).toBeNull();
  });

  it("hides the social row when no socialLinks URL is set", async () => {
    await renderFooter({
      socialLinks: { instagram: "", facebook: "", linkedin: "", youtube: "" },
    });
    expect(screen.queryByLabelText("Instagram")).toBeNull();
    expect(screen.queryByLabelText("Facebook")).toBeNull();
    expect(screen.queryByLabelText("LinkedIn")).toBeNull();
    expect(screen.queryByLabelText("YouTube")).toBeNull();
  });

  it("renders Form 990 and Candid links only when their URLs are provided", async () => {
    await renderFooter();
    expect(screen.queryByRole("link", { name: "Form 990" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Candid profile" })).toBeNull();

    // Re-render with both URLs set.
    document.body.innerHTML = "";
    await renderFooter({
      form990Url: "https://example.com/990",
      candidProfileUrl: "https://example.com/candid",
    });
    expect(screen.getByRole("link", { name: "Form 990" })).toHaveAttribute(
      "href",
      "https://example.com/990",
    );
    expect(screen.getByRole("link", { name: "Candid profile" })).toHaveAttribute(
      "href",
      "https://example.com/candid",
    );
  });
});
