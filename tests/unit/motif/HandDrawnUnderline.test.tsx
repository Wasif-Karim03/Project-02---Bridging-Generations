import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";

describe("HandDrawnUnderline", () => {
  it("renders an aria-hidden SVG with preserveAspectRatio=none", () => {
    const { container } = render(<HandDrawnUnderline />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
  });

  it("does not set an inline color — inherits currentColor from text context", () => {
    const { container } = render(<HandDrawnUnderline />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("style") ?? "").not.toContain("color:");
  });

  it("applies className", () => {
    const { container } = render(<HandDrawnUnderline className="sentinel-class" />);
    expect(container.querySelector("svg")).toHaveClass("sentinel-class");
  });
});
