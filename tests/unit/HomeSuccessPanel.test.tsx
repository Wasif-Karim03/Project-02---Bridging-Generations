import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { HomeSuccessPanel } from "@/app/(site)/_components/HomeSuccessPanel";

const stories = [
  {
    slug: "priya-university-dhaka",
    subjectName: "Priya",
    subjectRole: "Alum, now a university student in Dhaka",
    pullQuote: "I thought school would end for me after grade five.",
    portrait: { src: "/success-story-priya.jpg", alt: "Portrait of Priya" },
  },
  {
    slug: "rahim-engineering",
    subjectName: "Rahim",
    subjectRole: "Final-year engineering student",
    pullQuote: "The scholarship kept me through the years that mattered most.",
    portrait: { src: "/student-1.jpg", alt: "Portrait of Rahim" },
  },
  {
    slug: "anika-teacher",
    subjectName: "Anika",
    subjectRole: "Now a primary-school teacher",
    pullQuote: "I came back to teach because someone believed in me first.",
    portrait: { src: "/student-2.jpg", alt: "Portrait of Anika" },
  },
];

describe("HomeSuccessPanel", () => {
  it("renders three story cards", () => {
    render(<HomeSuccessPanel stories={stories} />);
    for (const s of stories) {
      expect(screen.getByText(s.subjectName)).toBeInTheDocument();
      expect(screen.getByText(s.subjectRole)).toBeInTheDocument();
    }
  });

  it("includes each story's pull quote", () => {
    render(<HomeSuccessPanel stories={stories} />);
    for (const s of stories) {
      expect(screen.getByText((content) => content.includes(s.pullQuote))).toBeInTheDocument();
    }
  });

  it("wires the section landmark via aria-labelledby", () => {
    const { container } = render(<HomeSuccessPanel stories={stories} />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-success-title");
    expect(container.querySelector("#home-success-title")).not.toBeNull();
  });

  it("links each card to its detail URL", () => {
    render(<HomeSuccessPanel stories={stories} />);
    for (const s of stories) {
      const link = screen.getByRole("link", { name: new RegExp(s.subjectName, "i") });
      expect(link).toHaveAttribute("href", `/success-stories/${s.slug}`);
    }
  });

  it("renders all three portraits with descriptive alt", () => {
    render(<HomeSuccessPanel stories={stories} />);
    for (const s of stories) {
      expect(screen.getByAltText(s.portrait.alt)).toBeInTheDocument();
    }
  });

  it("renders nothing when no stories are provided", () => {
    const { container } = render(<HomeSuccessPanel stories={[]} />);
    expect(container.querySelector("section")).toBeNull();
  });
});
