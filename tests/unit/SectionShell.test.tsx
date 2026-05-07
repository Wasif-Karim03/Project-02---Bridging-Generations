import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionShell } from "@/app/(site)/design/_components/SectionShell";

describe("SectionShell", () => {
  it("renders its section id for fragment navigation", () => {
    const { container } = render(
      <SectionShell id="color" number="§1" label="Color">
        <p>body</p>
      </SectionShell>,
    );
    expect(container.querySelector("#color")).not.toBeNull();
  });

  it("renders number and label in the heading", () => {
    render(
      <SectionShell id="typography" number="§2" label="Typography">
        <p>body</p>
      </SectionShell>,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading).toHaveTextContent("§2");
    expect(heading).toHaveTextContent("Typography");
  });

  it("renders meta pairs when provided", () => {
    render(
      <SectionShell
        id="shape"
        number="§4"
        label="Shape"
        meta={[
          { key: "samples", value: "5" },
          { key: "wcag", value: "aa" },
        ]}
      >
        <p>body</p>
      </SectionShell>,
    );
    expect(screen.getByText("samples")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("wcag")).toBeInTheDocument();
    expect(screen.getByText("aa")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <SectionShell id="x" number="§0" label="X">
        <p data-testid="child">body</p>
      </SectionShell>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
