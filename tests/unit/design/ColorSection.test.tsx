import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColorSection } from "@/app/(site)/design/_components/ColorSection";

describe("ColorSection", () => {
  it("renders all ten color tokens with hex values and text-safety badges", () => {
    render(<ColorSection />);

    const expected = [
      "--color-ground",
      "--color-ground-2",
      "--color-ground-3",
      "--color-ink",
      "--color-ink-2",
      "--color-hairline",
      "--color-accent",
      "--color-accent-2",
      "--color-accent-2-text",
      "--color-accent-3",
    ];
    for (const token of expected) {
      expect(screen.getByText(token)).toBeInTheDocument();
    }

    expect(screen.getByText("#F5F1EA")).toBeInTheDocument();
    expect(screen.getByText("#0F4C5C")).toBeInTheDocument();
    expect(screen.getByText("#B5462B")).toBeInTheDocument();

    expect(screen.getAllByText(/^non-text/).length).toBe(3);
    expect(screen.getAllByText(/^text-safe/).length).toBe(7);
  });
});
