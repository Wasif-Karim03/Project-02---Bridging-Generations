import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("smoke", () => {
  it("renders text into the dom", () => {
    render(<p>Hello</p>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
