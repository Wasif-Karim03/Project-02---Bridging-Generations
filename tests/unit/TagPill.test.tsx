import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TagPill } from "@/components/ui/TagPill";

describe("TagPill", () => {
  it("renders the default variant with a pill background", () => {
    const { container } = render(<TagPill>Default</TagPill>);
    const pill = container.querySelector("span");
    expect(pill).not.toBeNull();
    expect(pill?.className).toMatch(/rounded-full/);
    expect(pill?.className).toMatch(/bg-ground-3/);
    expect(pill?.className).not.toMatch(/border/);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders the live variant with a nested StatusDot span", () => {
    const { container } = render(<TagPill variant="live">Live</TagPill>);
    const pill = container.querySelector("span");
    expect(pill?.className).toMatch(/bg-ground-2/);
    // StatusDot renders as a nested span — wrapper + dot = 2 spans total.
    expect(container.querySelectorAll("span").length).toBe(2);
  });

  it("renders the stamp variant with a transparent border + accent-2-text color", () => {
    const { container } = render(<TagPill variant="stamp">Stamp</TagPill>);
    const pill = container.querySelector("span");
    expect(pill).not.toBeNull();
    expect(pill?.className).toMatch(/border/);
    expect(pill?.className).toMatch(/border-current/);
    expect(pill?.className).toMatch(/bg-transparent/);
    expect(pill?.className).toMatch(/text-accent-2-text/);
    expect(pill?.className).not.toMatch(/rounded-full/);
    // No nested StatusDot span on stamp.
    expect(container.querySelectorAll("span").length).toBe(1);
  });
});
