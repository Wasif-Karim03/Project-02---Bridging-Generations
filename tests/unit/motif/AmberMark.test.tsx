import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AmberMark } from "@/components/motif/AmberMark";

describe("AmberMark", () => {
  it("renders an aria-hidden SVG with preserveAspectRatio=none", () => {
    const { container } = render(<AmberMark />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
  });

  it("applies className and the amber color token", () => {
    const { container } = render(<AmberMark className="sentinel-class" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveClass("sentinel-class");
    expect(svg?.getAttribute("style")).toContain("var(--color-accent-3)");
  });
});
