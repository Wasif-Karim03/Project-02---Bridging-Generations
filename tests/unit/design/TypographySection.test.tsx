import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypographySection } from "@/app/(site)/design/_components/TypographySection";

describe("TypographySection", () => {
  it("renders all 15 type tier labels", () => {
    render(<TypographySection />);
    const expected = [
      "text-display-1",
      "text-display-2",
      "text-heading-1",
      "text-heading-2",
      "text-heading-3",
      "text-heading-4",
      "text-heading-5",
      "text-heading-6",
      "text-body-lg",
      "text-body",
      "text-body-sm",
      "text-meta",
      "text-eyebrow",
      "text-nav-link",
      "text-note",
    ];
    for (const name of expected) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("shows signature desktop and mobile sample sizes", () => {
    render(<TypographySection />);
    expect(screen.getAllByText(/desktop/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/88px/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/mobile/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/64px/)[0]).toBeInTheDocument();
  });

  it("renders the text-note sample in italic with its usage guidance", () => {
    render(<TypographySection />);
    const samples = screen.getAllByText("— starts any 1st of the month");
    expect(samples.length).toBeGreaterThan(0);
    for (const node of samples) {
      expect(node).toHaveStyle({ fontStyle: "italic" });
    }
    expect(
      screen.getByText("Used once per page as a handwritten voice inflection. Never for UI."),
    ).toBeInTheDocument();
  });
});
