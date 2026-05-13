import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Accordion } from "@/components/ui/Accordion";

describe("Accordion", () => {
  it("renders summary and content", () => {
    render(
      <Accordion summary="Explore">
        <p>Link list</p>
      </Accordion>,
    );
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Link list")).toBeInTheDocument();
  });

  it("uses native <details> + <summary>", () => {
    const { container } = render(
      <Accordion summary="X">
        <span>y</span>
      </Accordion>,
    );
    expect(container.querySelector("details")).not.toBeNull();
    expect(container.querySelector("summary")).not.toBeNull();
  });

  it("opens by default when defaultOpen is true", () => {
    const { container } = render(
      <Accordion summary="X" defaultOpen>
        <span>y</span>
      </Accordion>,
    );
    const details = container.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(true);
  });

  it("starts closed by default", () => {
    const { container } = render(
      <Accordion summary="X">
        <span>y</span>
      </Accordion>,
    );
    const details = container.querySelector("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);
  });
});
