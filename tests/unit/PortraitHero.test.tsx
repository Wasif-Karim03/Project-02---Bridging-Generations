import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { PortraitHero } from "@/app/(site)/success-stories/[slug]/_components/PortraitHero";
import type { SuccessStory } from "@/lib/content/successStories";

const base = {
  slug: "story",
  subjectName: "Subject",
  subjectRole: "Alum",
  pullQuote: "A quote",
  body: "Body",
  portrait: { src: "/s.jpg", alt: "portrait" },
  heroDuotone: false,
  published: true,
  publishedAt: "2026-01-01T00:00:00.000Z",
} as unknown as SuccessStory;

describe("PortraitHero", () => {
  it("omits the hero-duotone class when heroDuotone is false", () => {
    const { container } = render(<PortraitHero story={base} showPortrait />);
    expect(container.querySelector(".hero-duotone")).toBeNull();
  });

  it("applies the hero-duotone class when heroDuotone is true", () => {
    const withDuotone = { ...base, heroDuotone: true } as SuccessStory;
    const { container } = render(<PortraitHero story={withDuotone} showPortrait />);
    expect(container.querySelector(".hero-duotone")).not.toBeNull();
  });
});
