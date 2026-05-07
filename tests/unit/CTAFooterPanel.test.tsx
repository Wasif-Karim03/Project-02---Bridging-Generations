import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CTAFooterPanel } from "@/components/domain/CTAFooterPanel";

const props = {
  headline: "Hello world.",
  body: "A short paragraph inviting action.",
  ctaLabel: "Get started",
  ctaHref: "/start",
};

describe("CTAFooterPanel", () => {
  it("renders the headline as an h2 wired via aria-labelledby", () => {
    const { container } = render(<CTAFooterPanel {...props} titleId="demo-title" />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "demo-title");
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "demo-title");
    expect(heading).toHaveTextContent("Hello world.");
  });

  it("renders the body paragraph", () => {
    render(<CTAFooterPanel {...props} />);
    expect(screen.getByText("A short paragraph inviting action.")).toBeInTheDocument();
  });

  it("renders the primary CTA link", () => {
    render(<CTAFooterPanel {...props} />);
    const link = screen.getByRole("link", { name: "Get started" });
    expect(link).toHaveAttribute("href", "/start");
  });

  it("switches to teal surface when tone='teal'", () => {
    const { container } = render(<CTAFooterPanel {...props} tone="teal" />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("teal-panel");
    expect(section?.className).toContain("text-white");
  });

  it("defaults to cream surface", () => {
    const { container } = render(<CTAFooterPanel {...props} />);
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-ground");
    expect(section?.className).toContain("text-ink");
  });

  it("does not render the HorizonLine motif", () => {
    const { container: cream } = render(<CTAFooterPanel {...props} />);
    expect(cream.querySelector('svg[viewBox="0 0 1440 120"]')).toBeNull();
    const { container: teal } = render(<CTAFooterPanel {...props} tone="teal" />);
    expect(teal.querySelector('svg[viewBox="0 0 1440 120"]')).toBeNull();
  });
});
