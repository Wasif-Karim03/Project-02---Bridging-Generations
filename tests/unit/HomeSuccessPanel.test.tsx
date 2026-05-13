import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { HomeSuccessPanel } from "@/app/(site)/_components/HomeSuccessPanel";

const story = {
  slug: "priya-university-dhaka",
  subjectName: "Priya",
  subjectRole: "Alum, now a university student in Dhaka",
  pullQuote: "I thought school would end for me after grade five.",
  portrait: { src: "/success-story-priya.jpg", alt: "Portrait of Priya" },
};

describe("HomeSuccessPanel", () => {
  it("renders the featured quote inside a blockquote", () => {
    render(<HomeSuccessPanel story={story} />);
    const block = screen.getByRole("blockquote");
    expect(block).toHaveTextContent(story.pullQuote);
  });

  it("renders subject name and role", () => {
    render(<HomeSuccessPanel story={story} />);
    expect(screen.getByText(story.subjectName)).toBeInTheDocument();
    expect(screen.getByText(story.subjectRole)).toBeInTheDocument();
  });

  it("wires the section landmark to the quote via aria-labelledby", () => {
    const { container } = render(<HomeSuccessPanel story={story} />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-success-title");
    expect(container.querySelector("#home-success-title")).not.toBeNull();
  });

  it("links the CTA to the story's detail URL", () => {
    render(<HomeSuccessPanel story={story} />);
    const link = screen.getByRole("link", { name: /read priya/i });
    expect(link).toHaveAttribute("href", `/success-stories/${story.slug}`);
  });

  it("renders the portrait with descriptive alt", () => {
    render(<HomeSuccessPanel story={story} />);
    expect(screen.getByAltText(story.portrait.alt)).toBeInTheDocument();
  });
});
