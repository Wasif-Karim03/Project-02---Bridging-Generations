import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { StatusDot } from "@/components/ui/StatusDot";
import { TagPill } from "@/components/ui/TagPill";

describe("Eyebrow", () => {
  it("renders children with accent + eyebrow utilities", () => {
    render(<Eyebrow>Programs</Eyebrow>);
    const el = screen.getByText("Programs");
    expect(el.className).toContain("text-eyebrow");
    expect(el.className).toContain("text-accent");
    expect(el.className).toContain("uppercase");
  });
});

describe("TagPill", () => {
  it("renders default variant without a status dot", () => {
    const { container } = render(<TagPill>Sponsored</TagPill>);
    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(container.querySelector("span.rounded-full.size-2")).toBeNull();
  });

  it("renders live variant with a status dot", () => {
    const { container } = render(<TagPill variant="live">Live update</TagPill>);
    expect(screen.getByText("Live update")).toBeInTheDocument();
    expect(container.querySelector("span.rounded-full.size-2")).not.toBeNull();
  });
});

describe("StatusDot", () => {
  it("uses filled coral for active", () => {
    const { container } = render(<StatusDot variant="active" />);
    const dot = container.querySelector("span");
    expect(dot?.className).toContain("bg-accent-2");
    expect(dot?.className).not.toContain("border");
  });

  it("uses outlined style for pending", () => {
    const { container } = render(<StatusDot variant="pending" />);
    const dot = container.querySelector("span");
    expect(dot?.className).toContain("border");
    expect(dot?.className).toContain("border-ink-2");
  });

  it("exposes a label via role=img when provided", () => {
    render(<StatusDot variant="active" label="Active" />);
    expect(screen.getByRole("img", { name: "Active" })).toBeInTheDocument();
  });
});
