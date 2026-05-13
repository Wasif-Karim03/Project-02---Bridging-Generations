import { render } from "@testing-library/react";
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
    style: _style,
    ...rest
  }: AnyProps) => rest;
  const factory = (tag: string) => (props: AnyProps) => createElement(tag, stripMotion(props));
  return {
    motion: new Proxy({} as Record<string, ReturnType<typeof factory>>, {
      get: (_target, prop: string) => factory(prop),
    }),
    useReducedMotion: () => mockUseReducedMotion(),
    useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  };
});

import { ScrollProgressBar } from "@/components/motion/ScrollProgressBar";

describe("ScrollProgressBar", () => {
  it("renders nothing when reduced-motion is set", () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<ScrollProgressBar />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a fixed bar when motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { container } = render(<ScrollProgressBar />);
    const div = container.firstElementChild as HTMLElement;
    expect(div.className).toContain("fixed");
    expect(div.className).toContain("origin-left");
    expect(div.className).toContain("will-change-transform");
  });
});
