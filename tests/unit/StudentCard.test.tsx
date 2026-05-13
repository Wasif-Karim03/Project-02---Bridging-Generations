import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { StudentCard } from "@/components/domain/StudentCard";
import type { Student } from "@/lib/content/students";

const withPortrait: Student = {
  id: "demo-1",
  displayName: "Anika",
  schoolId: "demo-school",
  grade: 8,
  community: "marma",
  quote: "Short aspiration.",
  bio: "",
  portrait: { src: "/demo.jpg", alt: "Portrait of a smiling student" },
  consent: {
    portraitReleaseStatus: "granted",
    storyReleaseStatus: "granted",
    consentScope: ["website"],
    revokable: true,
    signedDate: "2025-09-01",
    releaseFormId: "BG-REL-2025-001",
    revokedAt: null,
  },
  sponsorshipStatus: "sponsored",
  enrolledAt: "2025-01-01",
};

const withoutConsent: Student = {
  ...withPortrait,
  id: "demo-2",
  displayName: "Tanuja",
  consent: {
    portraitReleaseStatus: "pending",
    storyReleaseStatus: "pending",
    consentScope: [],
    revokable: true,
    signedDate: null,
    releaseFormId: "",
    revokedAt: null,
  },
};

const PAPERCLIP_VIEWBOX = "0 0 24 40";

describe("StudentCard", () => {
  it("renders the displayName as the heading (first name only)", () => {
    render(<StudentCard student={withPortrait} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Anika");
  });

  it("renders the portrait when consent allows", () => {
    render(<StudentCard student={withPortrait} />);
    expect(screen.getByAltText("Portrait of a smiling student")).toBeInTheDocument();
  });

  it("renders the StudentPlaceholder when consent is not granted for website", () => {
    render(<StudentCard student={withoutConsent} />);
    expect(screen.getByRole("img", { name: /portrait not shown/i })).toBeInTheDocument();
    expect(screen.queryByAltText("Portrait of a smiling student")).toBeNull();
  });

  it("renders grade and community meta", () => {
    render(<StudentCard student={withPortrait} />);
    expect(screen.getByText(/Grade 8 · marma/)).toBeInTheDocument();
  });

  it("renders a TealPaperclip when the student is sponsored", () => {
    const { container } = render(<StudentCard student={withPortrait} />);
    expect(container.querySelector(`svg[viewBox="${PAPERCLIP_VIEWBOX}"]`)).not.toBeNull();
  });

  it("renders no paperclip when the student is awaiting a sponsor", () => {
    const { container } = render(
      <StudentCard student={{ ...withPortrait, sponsorshipStatus: "waiting" }} />,
    );
    expect(container.querySelector(`svg[viewBox="${PAPERCLIP_VIEWBOX}"]`)).toBeNull();
  });

  it("labels the article with name + sponsorship status + grade", () => {
    render(<StudentCard student={withPortrait} />);
    const article = screen.getByRole("article", { name: /Anika.*sponsored.*grade 8/i });
    expect(article).toBeInTheDocument();
  });

  it("uses 'awaiting sponsor' phrasing when not sponsored", () => {
    render(<StudentCard student={{ ...withPortrait, sponsorshipStatus: "waiting" }} />);
    expect(
      screen.getByRole("article", { name: /Anika.*awaiting sponsor.*grade 8/i }),
    ).toBeInTheDocument();
  });
});
