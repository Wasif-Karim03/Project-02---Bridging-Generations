import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";

const { mockUseReducedMotion } = vi.hoisted(() => ({
  mockUseReducedMotion: vi.fn(() => false),
}));

vi.mock("motion/react", () => {
  type AnyProps = Record<string, unknown> & { children?: unknown };
  const stripMotion = ({
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    whileInView: _whileInView,
    viewport: _viewport,
    layout: _layout,
    ...rest
  }: AnyProps) => rest;
  const factory = (tag: string) => (props: AnyProps) => createElement(tag, stripMotion(props));
  return {
    motion: new Proxy({} as Record<string, ReturnType<typeof factory>>, {
      get: (_target, prop: string) => factory(prop),
    }),
    useReducedMotion: () => mockUseReducedMotion(),
  };
});

import { FadeIn } from "@/components/motion/FadeIn";

describe("FadeIn", () => {
  it("renders children", () => {
    mockUseReducedMotion.mockReturnValue(false);
    render(<FadeIn>hello</FadeIn>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("applies will-change classes when motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { container } = render(<FadeIn className="extra">x</FadeIn>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("will-change-transform");
    expect(div.className).toContain("will-change-opacity");
    expect(div.className).toContain("extra");
  });

  it("omits will-change classes when reduced-motion is set", () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<FadeIn>x</FadeIn>);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).not.toContain("will-change-transform");
    expect(div.className).not.toContain("will-change-opacity");
  });
});
