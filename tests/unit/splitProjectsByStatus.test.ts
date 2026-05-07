import { describe, expect, it } from "vitest";
import { type Project, splitProjectsByStatus } from "@/lib/content/projects";

function make(id: string, status: Project["status"], order: number): Project {
  return {
    id,
    title: id,
    summary: "summary",
    body: "body",
    fundingGoal: 1000,
    fundingRaised: 500,
    status,
    heroImage: { src: "/x.jpg", alt: "x" },
    order,
    boardOwnerName: "",
    lastUpdated: null,
    mathLineItem: "",
  };
}

describe("splitProjectsByStatus", () => {
  it("splits by status and sorts each bucket by order ascending", () => {
    const result = splitProjectsByStatus([
      make("a", "active", 3),
      make("b", "active", 1),
      make("c", "funded", 2),
      make("d", "paused", 4),
    ]);
    expect(result.active.map((p) => p.id)).toEqual(["b", "a"]);
    expect(result.paused.map((p) => p.id)).toEqual(["d"]);
    expect(result.funded.map((p) => p.id)).toEqual(["c"]);
  });

  it("returns empty arrays when no projects match a status", () => {
    const result = splitProjectsByStatus([make("a", "active", 1)]);
    expect(result.paused).toEqual([]);
    expect(result.funded).toEqual([]);
  });

  it("handles an empty list", () => {
    const result = splitProjectsByStatus([]);
    expect(result).toEqual({ active: [], paused: [], funded: [] });
  });
});
