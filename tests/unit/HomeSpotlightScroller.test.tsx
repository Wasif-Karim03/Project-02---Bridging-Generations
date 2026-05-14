import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { HomeSpotlightScroller } from "@/app/(site)/_components/HomeSpotlightScroller";
import type { Student } from "@/lib/content/students";

const students: Student[] = [
  {
    id: "anika",
    displayName: "Anika",
    schoolId: "thanchi-high-school",
    grade: 8,
    quote: "Demo.",
    bio: "",
    portrait: { src: "/student-1.jpg", alt: "Anika" },
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
    enrolledAt: "2022-01-10",
    village: "",
    region: "",
    area: "",
    hobby: "",
    gpa: "",
    lifeTarget: "",
    registrationCode: "",
  },
];

describe("HomeSpotlightScroller", () => {
  it("renders section landmark wired via aria-labelledby", () => {
    const { container } = render(<HomeSpotlightScroller students={students} />);
    const section = container.querySelector("section[aria-labelledby='home-spotlight-title']");
    expect(section).not.toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("The students, up close");
  });

  it("surfaces the consent disclaimer near the scroller", () => {
    render(<HomeSpotlightScroller students={students} />);
    expect(screen.getByText(/signed, in-scope release/i)).toBeInTheDocument();
  });
});
