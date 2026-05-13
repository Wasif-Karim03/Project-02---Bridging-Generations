import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "@/components/ui/ProgressBar";

describe("ProgressBar", () => {
  it("sets aria-valuenow to the clamped percentage", () => {
    render(<ProgressBar percentage={42} label="Raised" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps below zero and above one hundred", () => {
    const { rerender } = render(<ProgressBar percentage={-10} label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    rerender(<ProgressBar percentage={150} label="x" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows a numeric percentage next to the label in default tone", () => {
    render(<ProgressBar percentage={55} label="Raised $5,500 of $10,000" />);
    expect(screen.getByText("Raised $5,500 of $10,000")).toBeInTheDocument();
    expect(screen.getByText("55%")).toBeInTheDocument();
  });

  it("swaps the label to 'fully funded' when tone is funded", () => {
    render(<ProgressBar percentage={80} tone="funded" />);
    expect(screen.getByText(/fully funded/i)).toBeInTheDocument();
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
  });

  it("hides the tip indicator at 0 and at funded", () => {
    const { container, rerender } = render(<ProgressBar percentage={0} label="x" />);
    expect(container.querySelector(".bg-accent-2")).toBeNull();
    rerender(<ProgressBar percentage={100} tone="funded" />);
    expect(container.querySelector(".bg-accent-2")).toBeNull();
  });
});
