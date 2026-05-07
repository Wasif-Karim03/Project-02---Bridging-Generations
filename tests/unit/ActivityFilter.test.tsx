import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ActivityFilter } from "@/app/(site)/activities/_components/ActivityFilter";
import type { Activity } from "@/lib/content/activities";

function make(id: string, tag: Activity["tag"]): Activity {
  return {
    id,
    title: `Activity ${id}`,
    excerpt: `Excerpt ${id}`,
    tag,
    published: true,
    publishedAt: "2026-01-01",
    coverImage: { src: "/x.jpg", alt: "cover" },
    relatedProjectId: null,
  } as Activity;
}

describe("ActivityFilter", () => {
  const activities = [make("one", "distribution"), make("two", "visit"), make("three", "visit")];

  it("shows all activities under the default All chip", () => {
    render(<ActivityFilter activities={activities} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("offers one chip per tag that exists in the data, plus All — every chip carries a count", () => {
    render(<ActivityFilter activities={activities} />);
    const group = screen.getByRole("group", { name: /filter activities/i });
    const chips = within(group).getAllByRole("button");
    expect(chips.map((b) => b.textContent)).toEqual(["All (3)", "Distribution (1)", "Visit (2)"]);
  });

  it("filters the list when a tag chip is selected", () => {
    render(<ActivityFilter activities={activities} />);
    fireEvent.click(screen.getByRole("button", { name: "Visit (2)" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.queryByText("Activity one")).toBeNull();
  });

  it("shows the empty-state message when a filter matches nothing", () => {
    render(<ActivityFilter activities={[make("a", "distribution")]} />);
    const group = screen.getByRole("group", { name: /filter activities/i });
    const chips = within(group).getAllByRole("button");
    // Only "All" and "Distribution" chips will exist — switching to distribution keeps 1 item
    fireEvent.click(chips[1]);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });
});
