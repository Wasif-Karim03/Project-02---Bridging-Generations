import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MuseumWall } from "@/components/ui/editorial/MuseumWall";

describe("MuseumWall", () => {
  it("renders Caption + Tier + Entry composition", () => {
    render(
      <MuseumWall ariaLabel="Honor roll">
        <MuseumWall.Caption>110 donors so far</MuseumWall.Caption>
        <MuseumWall.Tier label="Founder" count={3} />
        <MuseumWall.Entry scale="lg">Anonymous</MuseumWall.Entry>
        <MuseumWall.Entry scale="md">Anonymous</MuseumWall.Entry>
        <MuseumWall.Tier label="Patron" count={5} />
        <MuseumWall.Entry scale="md" caption="2024">
          Anonymous
        </MuseumWall.Entry>
      </MuseumWall>,
    );

    expect(screen.getByLabelText("Honor roll")).toBeInTheDocument();
    expect(screen.getByText("110 donors so far")).toBeInTheDocument();
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("Patron")).toBeInTheDocument();
    expect(screen.getAllByText("Anonymous")).toHaveLength(3);
    expect(screen.getByText("2024")).toBeInTheDocument();
  });

  it("uses CSS columns for the wall layout", () => {
    const { container } = render(
      <MuseumWall>
        <MuseumWall.Entry>Test</MuseumWall.Entry>
      </MuseumWall>,
    );
    const wall = container.querySelector("section");
    expect(wall?.className).toMatch(/columns-1/);
    expect(wall?.className).toMatch(/md:columns-2/);
    expect(wall?.className).toMatch(/lg:columns-3/);
  });

  it("renders the count next to the tier label when provided", () => {
    render(
      <MuseumWall>
        <MuseumWall.Tier label="Founder" count={42} />
      </MuseumWall>,
    );
    expect(screen.getByText("Founder")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });
});
