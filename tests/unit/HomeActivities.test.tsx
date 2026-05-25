import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { HomeActivities } from "@/app/(site)/_components/HomeActivities";
import type { Activity } from "@/lib/content/activities";

const activities: Activity[] = [
  {
    id: "spring-supplies-2026",
    title: "Spring term supplies delivered",
    excerpt: "Notebooks reached every classroom.",
    tag: "distribution",
    published: true,
    publishedAt: "2026-03-28",
    coverImage: { src: "/activity-distribution.jpg", alt: "Supplies" },
    relatedProjectId: null,
    pdfUrl: null,
    titleBn: "",
    excerptBn: "",
  },
  {
    id: "board-visit-rangpur-2026",
    title: "Board visit: a morning in the Rangpur classroom",
    excerpt: "A working visit.",
    tag: "visit",
    published: true,
    publishedAt: "2026-02-14",
    coverImage: { src: "/activity-visit.jpg", alt: "Visit" },
    relatedProjectId: null,
    pdfUrl: null,
    titleBn: "",
    excerptBn: "",
  },
];

describe("HomeActivities", () => {
  it("renders section landmark wired via aria-labelledby", async () => {
    const { container } = render(await HomeActivities({ activities }));
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-activities-title");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Recent activities");
  });

  it("renders one card per activity", async () => {
    render(await HomeActivities({ activities }));
    for (const a of activities) {
      expect(screen.getByText(a.title)).toBeInTheDocument();
    }
  });

  it("renders the 'See all activities' tertiary link", async () => {
    render(await HomeActivities({ activities }));
    const link = screen.getByRole("link", { name: /see all activities/i });
    expect(link).toHaveAttribute("href", "/activities");
  });
});
