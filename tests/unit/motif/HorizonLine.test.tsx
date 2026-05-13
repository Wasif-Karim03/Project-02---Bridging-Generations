import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HorizonLine } from "@/components/motif/HorizonLine";

describe("HorizonLine", () => {
  it("renders an aria-hidden SVG with preserveAspectRatio=none", () => {
    const { container } = render(<HorizonLine />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("preserveAspectRatio", "none");
  });

  it("defaults to on-cream with the teal accent color", () => {
    const { container } = render(<HorizonLine />);
    expect(container.querySelector("svg")?.getAttribute("style")).toContain("var(--color-accent)");
  });

  it("uses white for on-teal tone", () => {
    const { container } = render(<HorizonLine tone="on-teal" />);
    const style = container.querySelector("svg")?.getAttribute("style") ?? "";
    expect(style.toLowerCase()).toMatch(/#ffffff|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/);
    expect(style).not.toContain("var(--color-accent)");
  });

  it("applies className", () => {
    const { container } = render(<HorizonLine className="sentinel-class" />);
    expect(container.querySelector("svg")).toHaveClass("sentinel-class");
  });
});
