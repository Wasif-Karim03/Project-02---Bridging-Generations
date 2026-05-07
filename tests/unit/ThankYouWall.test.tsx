import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThankYouWall } from "@/components/domain/ThankYouWall";

describe("ThankYouWall", () => {
  it("renders every message", () => {
    const messages = [
      { message: "First message.", year: 2024 },
      { message: "Second message.", year: 2023 },
      { message: "Third message.", year: null },
    ];
    render(<ThankYouWall messages={messages} />);
    expect(screen.getByText("First message.")).toBeInTheDocument();
    expect(screen.getByText("Second message.")).toBeInTheDocument();
    expect(screen.getByText("Third message.")).toBeInTheDocument();
  });

  it("handles an empty list without crashing", () => {
    const { container } = render(<ThankYouWall messages={[]} />);
    expect(container.firstChild).toBeTruthy();
  });
});
