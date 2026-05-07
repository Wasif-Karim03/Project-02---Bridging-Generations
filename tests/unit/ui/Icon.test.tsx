import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon } from "@/components/ui/Icon";
import { ArrowRight } from "@/components/ui/icons";

describe("Icon", () => {
  it("renders aria-hidden when no label is supplied", () => {
    const { container } = render(<Icon icon={ArrowRight} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
    expect(svg?.getAttribute("role")).toBeNull();
  });

  it("exposes role=img with aria-label when label is supplied", () => {
    render(<Icon icon={ArrowRight} label="Continue" />);
    const svg = screen.getByRole("img", { name: "Continue" });
    expect(svg.tagName.toLowerCase()).toBe("svg");
  });

  it("uses default 20px size and 1.75 stroke", () => {
    const { container } = render(<Icon icon={ArrowRight} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("20");
    expect(svg?.getAttribute("stroke-width")).toBe("1.75");
  });
});
