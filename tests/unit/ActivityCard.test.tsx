import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { ActivityCard } from "@/components/domain/ActivityCard";
import type { Activity } from "@/lib/content/activities";

const sample: Activity = {
  id: "demo-activity",
  title: "A demo activity",
  excerpt: "A short description of what happened.",
  tag: "distribution",
  published: true,
  publishedAt: "2026-03-15",
  coverImage: { src: "/demo.jpg", alt: "Demo cover" },
  relatedProjectId: null,
};

describe("ActivityCard", () => {
  it("renders the activity title and excerpt", () => {
    render(<ActivityCard activity={sample} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("A demo activity");
    expect(screen.getByText(sample.excerpt)).toBeInTheDocument();
  });

  it("renders the tag label in the eyebrow (Title Case via ACTIVITY_TAG_LABELS)", () => {
    render(<ActivityCard activity={sample} />);
    expect(screen.getByText("Distribution")).toBeInTheDocument();
  });

  it("renders a semantic <time> element for the date", () => {
    const { container } = render(<ActivityCard activity={sample} />);
    const time = container.querySelector("time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("datetime", "2026-03-15");
    expect(time).toHaveTextContent("March 15, 2026");
  });

  it("renders as a plain row without a clickable headline (no detail page)", () => {
    render(<ActivityCard activity={sample} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders the root as <li> when as='li'", () => {
    const { container } = render(
      <ul>
        <ActivityCard activity={sample} as="li" />
      </ul>,
    );
    expect(container.querySelector("li")).not.toBeNull();
  });
});
