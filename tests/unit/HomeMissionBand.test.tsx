import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeMissionBand } from "@/app/(site)/_components/HomeMissionBand";

const missionFull = "ignored — component now reads from translation files";

// The translated mission body from messages/en.json (home.missionBody).
const MISSION_BODY =
  "Establishing an enlightened generation through sustainable education bridging — and extending the helping hands to ensure poverty may not be the hindrance to the education of the unprivileged and neglected people.";

describe("HomeMissionBand", () => {
  it("renders the section h2 separately from the mission body paragraph", async () => {
    const { container } = render(await HomeMissionBand({ missionFull }));
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("id", "home-mission-title");
    // The H2 is the headline, not the mission body.
    expect(heading).not.toHaveTextContent(MISSION_BODY);
    // The full mission copy lives in a body <p> below the heading.
    const paragraph = container.querySelector("p.text-body-lg");
    expect(paragraph).not.toBeNull();
    expect(paragraph).toHaveTextContent(MISSION_BODY);
  });

  it("wires the section landmark to the h2 via aria-labelledby", async () => {
    const { container } = render(await HomeMissionBand({ missionFull }));
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby", "home-mission-title");
    expect(container.querySelector("#home-mission-title")).not.toBeNull();
  });

  it("renders an 'Our mission' eyebrow label", async () => {
    render(await HomeMissionBand({ missionFull }));
    expect(screen.getByText("Our mission")).toBeInTheDocument();
  });

  it("wraps copy in a single Reveal container", async () => {
    const { container } = render(await HomeMissionBand({ missionFull }));
    const reveals = container.querySelectorAll(".reveal-on-scroll");
    expect(reveals).toHaveLength(1);
  });
});
