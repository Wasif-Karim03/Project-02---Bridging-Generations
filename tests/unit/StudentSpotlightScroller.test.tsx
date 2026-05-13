import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { StudentSpotlightScroller } from "@/components/domain/StudentSpotlightScroller";
import type { Student } from "@/lib/content/students";

function makeStudent(id: string, name: string): Student {
  return {
    id,
    displayName: name,
    schoolId: "demo-school",
    grade: 5,
    community: "marma",
    quote: "Demo quote.",
    bio: "",
    portrait: { src: `/${id}.jpg`, alt: `Portrait of ${name}` },
    consent: {
      portraitReleaseStatus: "granted",
      storyReleaseStatus: "granted",
      signedDate: "2025-09-01",
      releaseFormId: "BG-REL-2025-001",
      consentScope: ["website"],
      revokable: true,
      revokedAt: null,
    },
    sponsorshipStatus: "sponsored",
    enrolledAt: "2025-01-01",
  };
}

const students: Student[] = Array.from({ length: 6 }, (_, i) =>
  makeStudent(`s${i + 1}`, `Student ${i + 1}`),
);

describe("StudentSpotlightScroller", () => {
  it("renders a scroll region with an accessible name", () => {
    const { container } = render(<StudentSpotlightScroller students={students} />);
    const region = container.querySelector("section[aria-label][tabindex='0']");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-label")).toMatch(/student spotlight/i);
  });

  it("renders one list item per student", () => {
    render(<StudentSpotlightScroller students={students} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(6);
  });
});
