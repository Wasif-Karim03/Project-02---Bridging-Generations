import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CornerBracket } from "@/components/motif/CornerBracket";

describe("CornerBracket", () => {
  it("renders four aria-hidden bracket SVGs with the muted ink-2 color class", () => {
    const { container } = render(<CornerBracket>content</CornerBracket>);
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(4);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveClass("text-ink-2/50");
    }
  });

  it("renders outer rule + inner rule + terminal serifs in each bracket (12 paths total)", () => {
    const { container } = render(<CornerBracket>x</CornerBracket>);
    // Four brackets × three path elements (outer L, inner L, serifs) = twelve.
    const paths = container.querySelectorAll("svg path");
    expect(paths).toHaveLength(12);
  });

  it("renders its children inside the frame", () => {
    render(<CornerBracket>inside the frame</CornerBracket>);
    expect(screen.getByText("inside the frame")).toBeInTheDocument();
  });

  it("applies className to the wrapper div alongside the relative class", () => {
    const { container } = render(<CornerBracket className="sentinel-class">x</CornerBracket>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("sentinel-class");
    expect(wrapper).toHaveClass("relative");
  });
});
