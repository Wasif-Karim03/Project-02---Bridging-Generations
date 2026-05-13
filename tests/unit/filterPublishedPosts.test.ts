import { describe, expect, it } from "vitest";
import { type BlogPost, filterPublishedPosts } from "@/lib/content/blogPosts";

function make(
  slug: string,
  publishedAt: string | null,
  published = true,
  featured = false,
): BlogPost {
  return {
    slug,
    title: slug,
    excerpt: "excerpt",
    body: () => Promise.resolve(""),
    coverImage: { src: "/x.jpg", alt: "x" },
    author: null,
    published,
    publishedAt,
    featured,
    tags: [],
    metaTitle: "",
    metaDescription: "",
    ogImageOverride: { src: null, alt: "" },
  } as unknown as BlogPost;
}

describe("filterPublishedPosts", () => {
  it("drops posts with published: false", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const result = filterPublishedPosts(
      [make("a", "2026-01-01", true), make("b", "2026-01-02", false)],
      now,
    );
    expect(result.map((p) => p.slug)).toEqual(["a"]);
  });

  it("drops posts dated in the future", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const result = filterPublishedPosts(
      [make("a", "2026-01-01"), make("future", "2099-01-01")],
      now,
    );
    expect(result.map((p) => p.slug)).toEqual(["a"]);
  });

  it("sorts by publishedAt descending", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const result = filterPublishedPosts(
      [make("a", "2025-03-01"), make("b", "2026-01-15"), make("c", "2025-11-20")],
      now,
    );
    expect(result.map((p) => p.slug)).toEqual(["b", "c", "a"]);
  });

  it("drops posts with missing publishedAt", () => {
    const now = new Date("2026-04-23T00:00:00Z");
    const result = filterPublishedPosts([make("a", null), make("b", "2025-11-20")], now);
    expect(result.map((p) => p.slug)).toEqual(["b"]);
  });
});
