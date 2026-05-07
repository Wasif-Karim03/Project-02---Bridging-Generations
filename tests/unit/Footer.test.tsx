import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders the wordmark and the tagline prop", () => {
    render(<Footer tagline="Sponsoring 156 students across the Chittagong Hill Tracts." />);
    expect(screen.getByText("Bridging Generations")).toBeInTheDocument();
    expect(
      screen.getByText(/Sponsoring 156 students across the Chittagong Hill Tracts/i),
    ).toBeInTheDocument();
  });

  it("renders the Explore section heading and drops Resources", () => {
    render(<Footer />);
    // Explore renders twice: once in the <sm Accordion summary, once in the
    // sm+ flat eyebrow. Both branches are in the DOM (only one is visible at
    // a given viewport via Tailwind's sm: utility).
    expect(screen.getAllByText("Explore").length).toBeGreaterThan(0);
    expect(screen.queryByText("Resources")).toBeNull();
  });

  it("renders the Contact section heading only when contactEmail is provided", () => {
    const { rerender } = render(<Footer />);
    expect(screen.queryByText("Contact")).toBeNull();
    rerender(<Footer contactEmail="info@bridginggenerations.org" />);
    // Contact renders twice for the same accordion/flat parallel-layout reason.
    expect(screen.getAllByText("Contact").length).toBeGreaterThan(0);
  });

  it("renders representative Explore + Contact links", () => {
    render(<Footer contactEmail="info@bridginggenerations.org" />);
    // Each link is rendered in both the <sm accordion and sm+ flat layout.
    // Verify at least one instance exists with the expected href.
    expect(screen.getAllByRole("link", { name: "About" })[0]).toHaveAttribute("href", "/about");
    expect(screen.getAllByRole("link", { name: "Blog" })[0]).toHaveAttribute("href", "/blog");
    expect(screen.getAllByRole("link", { name: "Email us" })[0]).toHaveAttribute(
      "href",
      "mailto:info@bridginggenerations.org",
    );
  });

  it("renders the legal Terms link in the bottom bar", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/terms");
  });

  it("renders the current year in the copyright line", () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });

  it("hides the trust line entirely when no real EIN is passed", () => {
    render(<Footer />);
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("hides the trust line when ein is the 00-0000000 placeholder", () => {
    render(<Footer ein="00-0000000" />);
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("hides the trust line when ein is a [CONFIRM:...] stub", () => {
    render(<Footer ein="[CONFIRM: ein]" />);
    expect(screen.queryByText(/Tax-deductible/)).toBeNull();
  });

  it("renders the EIN in the trust line when a real value is provided", () => {
    render(<Footer ein="12-3456789" />);
    const trustLine = screen.getByText(/Tax-deductible/);
    expect(trustLine).toHaveTextContent("501(c)(3) · EIN 12-3456789 · Tax-deductible");
  });

  it("hides the mailing address when value is a [CONFIRM:...] stub", () => {
    render(<Footer mailingAddress="[CONFIRM: mailing address]" />);
    expect(screen.queryByText(/CONFIRM/)).toBeNull();
  });

  it("hides the social row when no socialLinks URL is set", () => {
    render(<Footer socialLinks={{ instagram: "", facebook: "", linkedin: "", youtube: "" }} />);
    expect(screen.queryByLabelText("Instagram")).toBeNull();
    expect(screen.queryByLabelText("Facebook")).toBeNull();
    expect(screen.queryByLabelText("LinkedIn")).toBeNull();
    expect(screen.queryByLabelText("YouTube")).toBeNull();
  });

  it("renders Form 990 and Candid links only when their URLs are provided", () => {
    const { rerender } = render(<Footer />);
    expect(screen.queryByRole("link", { name: "Form 990" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Candid profile" })).toBeNull();
    rerender(
      <Footer form990Url="https://example.com/990" candidProfileUrl="https://example.com/candid" />,
    );
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
