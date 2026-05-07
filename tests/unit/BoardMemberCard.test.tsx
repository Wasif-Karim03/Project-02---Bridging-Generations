import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { BoardMemberCard } from "@/components/domain/BoardMemberCard";
import type { BoardMember } from "@/lib/content/boardMembers";

const withPortrait: BoardMember = {
  id: "jane-doe",
  name: "Jane Doe",
  role: "Founder & President",
  bio: "Jane founded the organization after years of working in the Hill Tracts.",
  portrait: { src: "/images/board/jane.jpg", alt: "Jane Doe" },
  order: 1,
};

const withoutPortrait: BoardMember = {
  ...withPortrait,
  id: "alex-morgan",
  name: "Alex Morgan",
  portrait: { src: null, alt: "" },
};

describe("BoardMemberCard", () => {
  it("renders the name, role, and bio", () => {
    render(<BoardMemberCard member={withPortrait} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Jane Doe");
    expect(screen.getByText("Founder & President")).toBeInTheDocument();
    expect(screen.getByText(withPortrait.bio)).toBeInTheDocument();
  });

  it("renders the portrait with provided alt when present", () => {
    render(<BoardMemberCard member={withPortrait} />);
    const img = screen.getByRole("img", { name: "Jane Doe" });
    expect(img).toHaveAttribute("src", "/images/board/jane.jpg");
  });

  it("renders an initials Avatar when no portrait is set", () => {
    const { container } = render(<BoardMemberCard member={withoutPortrait} />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByLabelText("Alex Morgan")).toHaveTextContent("AM");
  });

  it("respects headingLevel override", () => {
    render(<BoardMemberCard member={withPortrait} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Jane Doe");
  });
});
