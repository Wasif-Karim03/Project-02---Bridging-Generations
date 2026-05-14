import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { HomeProgramsGrid } from "@/app/(site)/_components/HomeProgramsGrid";
import type { Project } from "@/lib/content/projects";

const projects: Project[] = [
  {
    id: "school-meal-program",
    title: "School meal program",
    summary: "A short summary.",
    body: "Body text.",
    fundingGoal: 12000,
    fundingRaised: 8400,
    status: "active",
    heroImage: { src: "/project-meal.jpg", alt: "Meal photo" },
    order: 1,
    boardOwnerName: "",
    lastUpdated: null,
    mathLineItem: "",
    titleBn: "",
    summaryBn: "",
    bodyBn: "",
  },
  {
    id: "girls-scholarship",
    title: "Girls' scholarship fund",
    summary: "A short summary.",
    body: "Body text.",
    fundingGoal: 15000,
    fundingRaised: 15000,
    status: "funded",
    heroImage: { src: "/project-scholarship.jpg", alt: "Scholarship photo" },
    order: 2,
    boardOwnerName: "",
    lastUpdated: null,
    mathLineItem: "",
    titleBn: "",
    summaryBn: "",
    bodyBn: "",
  },
];

describe("HomeProgramsGrid", () => {
  it("renders the section heading as an h2 wired via aria-labelledby", () => {
    const { container } = render(<HomeProgramsGrid projects={projects} />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-programs-title");
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "home-programs-title");
    expect(heading).toHaveTextContent("Our projects");
  });

  it("renders the eyebrow and 'See all projects' tertiary link", () => {
    render(<HomeProgramsGrid projects={projects} />);
    expect(screen.getByText("How we help")).toBeInTheDocument();
    const seeAll = screen.getByRole("link", { name: /see all projects/i });
    expect(seeAll).toHaveAttribute("href", "/projects");
  });

  it("renders one ProgramCard per project", () => {
    render(<HomeProgramsGrid projects={projects} />);
    for (const project of projects) {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    }
  });
});
