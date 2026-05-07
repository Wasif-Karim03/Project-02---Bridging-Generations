import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { Feature } from "@/components/ui/editorial";

describe("Feature", () => {
  it("renders breakout layout by default and centered when breakout=false", () => {
    const { container, rerender } = render(
      <Feature>
        <Feature.Body>
          <Feature.Headline href="/x">Breakout headline</Feature.Headline>
        </Feature.Body>
      </Feature>,
    );
    expect(container.querySelector(".lg\\:grid-cols-\\[5fr_7fr\\]")).not.toBeNull();
    rerender(
      <Feature breakout={false}>
        <Feature.Body>
          <Feature.Headline href="/x">Centered headline</Feature.Headline>
        </Feature.Body>
      </Feature>,
    );
    expect(container.querySelector(".lg\\:grid-cols-\\[5fr_7fr\\]")).toBeNull();
  });

  it("yields a single tap target via Feature.Headline", () => {
    render(
      <Feature>
        <Feature.Image src="/x.jpg" alt="cover" />
        <Feature.Body>
          <Feature.Eyebrow>Field update</Feature.Eyebrow>
          <Feature.Headline href="/blog/spring">Spring update.</Feature.Headline>
          <Feature.Lede>Lede paragraph.</Feature.Lede>
        </Feature.Body>
      </Feature>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/blog/spring");
  });

  it("renders a non-link headline when href is omitted (typography-led)", () => {
    render(
      <Feature breakout={false}>
        <Feature.Body>
          <Feature.Headline as="h2">Quote-led feature.</Feature.Headline>
        </Feature.Body>
      </Feature>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Quote-led feature.");
  });

  it("supports lg:-ml-[6%] image bleed when bleed is set", () => {
    const { container } = render(
      <Feature>
        <Feature.Image src="/x.jpg" alt="cover" bleed />
        <Feature.Body>
          <Feature.Headline href="/x">Headline</Feature.Headline>
        </Feature.Body>
      </Feature>,
    );
    expect(container.querySelector(".lg\\:-ml-\\[6\\%\\]")).not.toBeNull();
  });
});
