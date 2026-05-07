import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { Row } from "@/components/ui/editorial";

describe("Row", () => {
  it("exposes exactly one tap target via Row.Headline", () => {
    render(
      <Row>
        <Row.Image src="/x.jpg" alt="cover" />
        <Row.Body>
          <Row.Eyebrow>Mar 2026 · Khagrachari</Row.Eyebrow>
          <Row.Headline href="/activities/spring">Spring supplies arrived.</Row.Headline>
        </Row.Body>
      </Row>,
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/activities/spring");
  });

  it("renders the headline at the requested heading level", () => {
    render(
      <Row>
        <Row.Body>
          <Row.Headline href="/x" as="h2">
            Section title
          </Row.Headline>
        </Row.Body>
      </Row>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Section title");
  });

  it("renders as <li> when as='li' is passed", () => {
    const { container } = render(
      <ul>
        <Row as="li">
          <Row.Body>
            <Row.Headline href="/x">Item</Row.Headline>
          </Row.Body>
        </Row>
      </ul>,
    );
    expect(container.querySelector("li")).not.toBeNull();
  });

  it("draws a hairline rule by default and hides it when hideRule is set", () => {
    const { container, rerender } = render(
      <Row>
        <Row.Body>
          <Row.Headline href="/x">Item</Row.Headline>
        </Row.Body>
      </Row>,
    );
    const ruled = container.querySelector(".border-t.border-hairline");
    expect(ruled).not.toBeNull();
    rerender(
      <Row hideRule>
        <Row.Body>
          <Row.Headline href="/x">Item</Row.Headline>
        </Row.Body>
      </Row>,
    );
    expect(container.querySelector(".border-t.border-hairline")).toBeNull();
  });

  it("extends the click region via after:* by default", () => {
    const { container } = render(
      <Row>
        <Row.Body>
          <Row.Headline href="/x">Headline</Row.Headline>
        </Row.Body>
      </Row>,
    );
    const link = container.querySelector("a");
    expect(link?.className).toMatch(/after:absolute/);
    expect(link?.className).toMatch(/after:inset-0/);
  });

  it("omits the click-region extension when cardClickable is false", () => {
    const { container } = render(
      <Row>
        <Row.Body>
          <Row.Headline href="/x" cardClickable={false}>
            Headline
          </Row.Headline>
        </Row.Body>
      </Row>,
    );
    const link = container.querySelector("a");
    expect(link?.className).not.toMatch(/after:absolute/);
  });

  it("renders the headline as plain heading when href is omitted", () => {
    render(
      <Row>
        <Row.Body>
          <Row.Headline>No detail page for this row.</Row.Headline>
        </Row.Body>
      </Row>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "No detail page for this row.",
    );
    expect(screen.queryByRole("link")).toBeNull();
  });
});
