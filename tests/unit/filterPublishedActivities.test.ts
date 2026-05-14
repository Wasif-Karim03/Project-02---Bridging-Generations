import { describe, expect, it } from "vitest";
import { type Activity, filterPublishedActivities } from "@/lib/content/activities";

function make(
  id: string,
  publishedAt: string,
  published = true,
  tag: Activity["tag"] = "milestone",
): Activity {
  return {
    id,
    title: id,
    excerpt: "excerpt",
    tag,
    published,
    publishedAt,
    coverImage: { src: "/x.jpg", alt: "x" },
    relatedProjectId: null,
    pdfUrl: null,
    titleBn: "",
    excerptBn: "",
  } as Activity;
}

describe("filterPublishedActivities", () => {
  it("drops activities with published: false", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const out = filterPublishedActivities(
      [make("a", "2026-01-01", true), make("b", "2026-01-02", false)],
      now,
    );
    expect(out.map((a) => a.id)).toEqual(["a"]);
  });

  it("drops activities dated in the future", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const out = filterPublishedActivities(
      [make("a", "2026-01-01"), make("future", "2099-01-01")],
      now,
    );
    expect(out.map((a) => a.id)).toEqual(["a"]);
  });

  it("sorts activities by publishedAt descending", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const out = filterPublishedActivities(
      [make("a", "2025-03-01"), make("b", "2026-01-15"), make("c", "2025-11-20")],
      now,
    );
    expect(out.map((a) => a.id)).toEqual(["b", "c", "a"]);
  });
});
