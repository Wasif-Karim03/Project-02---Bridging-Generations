import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { Tile } from "@/components/ui/editorial";

describe("Tile", () => {
  it("renders a single anchor when href is passed", () => {
    render(
      <Tile href="/gallery/abc">
        <Tile.Image src="/x.jpg" alt="Classroom" />
        <Tile.Label>Classroom · 2026</Tile.Label>
      </Tile>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/gallery/abc");
  });

  it("renders no link when href is omitted", () => {
    render(
      <Tile>
        <Tile.Image src="/x.jpg" alt="Classroom" />
      </Tile>,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("locks the image to the requested aspect ratio", () => {
    const { container } = render(
      <Tile>
        <Tile.Image src="/x.jpg" alt="Classroom" aspect="1/1" />
      </Tile>,
    );
    expect(container.querySelector(".aspect-\\[1\\/1\\]")).not.toBeNull();
  });
});
