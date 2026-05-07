import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MotifSection } from "@/app/(site)/design/_components/MotifSection";

describe("MotifSection", () => {
  it("labels all six motifs", () => {
    render(<MotifSection />);
    for (const name of [
      "CoralArc",
      "AmberMark",
      "TealPaperclip",
      "HandDrawnUnderline",
      "HorizonLine",
      "CornerBracket",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("mounts under the 'motif' section id", () => {
    const { container } = render(<MotifSection />);
    expect(container.querySelector("#motif")).toBeInTheDocument();
  });

  it("renders a CornerBracket demo with its sample framed child", () => {
    render(<MotifSection />);
    expect(screen.getByText(/Framed content/)).toBeInTheDocument();
  });
});
