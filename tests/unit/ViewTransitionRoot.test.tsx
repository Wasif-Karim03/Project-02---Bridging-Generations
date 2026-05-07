import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViewTransitionRoot } from "@/components/layout/ViewTransitionRoot";

describe("ViewTransitionRoot", () => {
  it("renders its children", () => {
    render(
      <ViewTransitionRoot>
        <span data-testid="child">hello</span>
      </ViewTransitionRoot>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
