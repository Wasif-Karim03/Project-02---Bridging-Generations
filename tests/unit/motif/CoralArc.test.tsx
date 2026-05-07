import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CoralArc } from "@/components/motif/CoralArc";

describe("CoralArc", () => {
  it("renders an aria-hidden SVG", () => {
    const { container } = render(<CoralArc />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("applies className to the svg root", () => {
    const { container } = render(<CoralArc className="sentinel-class" />);
    expect(container.querySelector("svg")).toHaveClass("sentinel-class");
  });

  it("defaults to the coral (accent-2) tone", () => {
    const { container } = render(<CoralArc />);
    expect(container.querySelector("svg")?.getAttribute("style")).toContain(
      "var(--color-accent-2)",
    );
  });

  it("switches to teal when tone='accent'", () => {
    const { container } = render(<CoralArc tone="accent" />);
    const style = container.querySelector("svg")?.getAttribute("style") ?? "";
    expect(style).toContain("var(--color-accent)");
    expect(style).not.toContain("var(--color-accent-2)");
  });
});
