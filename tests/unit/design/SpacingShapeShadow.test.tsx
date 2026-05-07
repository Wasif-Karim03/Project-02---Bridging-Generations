import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ShadowSection } from "@/app/(site)/design/_components/ShadowSection";
import { ShapeSection } from "@/app/(site)/design/_components/ShapeSection";
import { SpacingSection } from "@/app/(site)/design/_components/SpacingSection";

describe("SpacingSection", () => {
  it("renders all section-rhythm tokens", () => {
    render(<SpacingSection />);
    for (const token of [
      "--space-section-sm",
      "--space-section-md",
      "--space-section-lg",
      "--space-section-xl",
    ]) {
      expect(screen.getByText(token)).toBeInTheDocument();
    }
    expect(screen.getByText("--space-container-x")).toBeInTheDocument();
  });
});

describe("ShapeSection", () => {
  it("renders all five shape samples", () => {
    render(<ShapeSection />);
    for (const label of ["Sharp", "Pill", "Squircle", "Scoop", "Bevel"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});

describe("ShadowSection", () => {
  it("renders all three shadow tokens", () => {
    render(<ShadowSection />);
    for (const token of ["--shadow-card", "--shadow-card-hover", "--shadow-cta"]) {
      expect(screen.getByText(token)).toBeInTheDocument();
    }
  });
});
