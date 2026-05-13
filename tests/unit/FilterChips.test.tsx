import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterChips } from "@/components/ui/FilterChips";

describe("FilterChips", () => {
  it("renders each option as a button and marks the active one pressed", () => {
    render(
      <FilterChips
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value="a"
        onChange={() => {}}
        ariaLabel="Filter"
      />,
    );
    expect(screen.getByRole("button", { name: "A", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "B", pressed: false })).toBeInTheDocument();
  });

  it("calls onChange with the selected value on click", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterChips
        options={[
          { value: "a", label: "A" },
          { value: "b", label: "B" },
        ]}
        value="a"
        onChange={onChange}
        ariaLabel="Filter"
      />,
    );
    await user.click(screen.getByRole("button", { name: "B" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("appends the count to the label when provided", () => {
    render(
      <FilterChips
        options={[{ value: "a", label: "All", count: 12 }]}
        value="a"
        onChange={() => {}}
        ariaLabel="Filter"
      />,
    );
    expect(screen.getByRole("button", { name: "All (12)" })).toBeInTheDocument();
  });

  it("labels the group via sr-only legend", () => {
    render(
      <FilterChips
        options={[{ value: "a", label: "A" }]}
        value="a"
        onChange={() => {}}
        ariaLabel="Filter by type"
      />,
    );
    expect(screen.getByText("Filter by type")).toBeInTheDocument();
  });
});
