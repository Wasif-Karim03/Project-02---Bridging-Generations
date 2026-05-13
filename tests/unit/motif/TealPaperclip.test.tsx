import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TealPaperclip } from "@/components/motif/TealPaperclip";

describe("TealPaperclip", () => {
  it("renders an aria-hidden SVG in the teal accent color", () => {
    const { container } = render(<TealPaperclip />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg?.getAttribute("style")).toContain("var(--color-accent)");
  });

  it("applies className", () => {
    const { container } = render(<TealPaperclip className="sentinel-class" />);
    expect(container.querySelector("svg")).toHaveClass("sentinel-class");
  });
});
