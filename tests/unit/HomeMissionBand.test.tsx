import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeMissionBand } from "@/app/(site)/_components/HomeMissionBand";

const missionFull =
  "Bridging Generations empowers underprivileged children in the Chittagong Hill Tracts through education sponsorship — tuition, books, meals, and the structural support that keeps students in the classroom instead of the workforce.";

describe("HomeMissionBand", () => {
  it("renders the section h2 separately from the mission body paragraph", () => {
    const { container } = render(<HomeMissionBand missionFull={missionFull} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "home-mission-title");
    // The H2 is now a real headline, not the entire mission paragraph.
    expect(heading).not.toHaveTextContent(missionFull);
    // The full mission copy lives in a body <p> below the heading.
    const paragraph = container.querySelector("p.text-body-lg");
    expect(paragraph).not.toBeNull();
    expect(paragraph).toHaveTextContent(missionFull);
  });

  it("wires the section landmark to the h2 via aria-labelledby", () => {
    const { container } = render(<HomeMissionBand missionFull={missionFull} />);
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-mission-title");
    expect(container.querySelector("#home-mission-title")).not.toBeNull();
  });

  it("renders an 'Our mission' eyebrow label", () => {
    render(<HomeMissionBand missionFull={missionFull} />);
    expect(screen.getByText("Our mission")).toBeInTheDocument();
  });

  it("wraps copy in a single Reveal container", () => {
    const { container } = render(<HomeMissionBand missionFull={missionFull} />);
    const reveals = container.querySelectorAll(".reveal-on-scroll");
    expect(reveals).toHaveLength(1);
  });
});
