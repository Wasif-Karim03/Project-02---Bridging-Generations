import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/components/ui/ProgressBar";

describe("ProgressBar", () => {
  it("renders percentage and custom label in the default tone", () => {
    render(<ProgressBar percentage={42} label="Raised $420 of $1000" />);
    expect(screen.getByText("Raised $420 of $1000")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
  });

  it("renders 'Fully funded — thank you' and hides the percentage when tone is funded", () => {
    render(<ProgressBar percentage={75} tone="funded" />);
    expect(screen.getByText("Fully funded — thank you")).toBeInTheDocument();
    expect(screen.queryByText("75%")).toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("renders 'Paused' label, hides the percentage, and preserves aria-valuenow when tone is paused", () => {
    render(<ProgressBar percentage={30} tone="paused" />);
    expect(screen.getByText("Paused")).toBeInTheDocument();
    expect(screen.queryByText("30%")).toBeNull();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "30");
  });

  it("clamps percentage to [0, 100]", () => {
    render(<ProgressBar percentage={150} label="capped" />);
    // 150 clamps to 100, which flips the component into the funded rendering
    expect(screen.getByText("Fully funded — thank you")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
