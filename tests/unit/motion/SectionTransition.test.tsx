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
    useTransform: () => ({ get: () => 1 }),
  };
});

import { SectionTransition } from "@/components/motion/SectionTransition";

describe("SectionTransition", () => {
  it("renders as a <section> with id and className", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { container } = render(
      <SectionTransition id="hero" className="bg-ground">
        body
      </SectionTransition>,
    );
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.id).toBe("hero");
    expect(section?.className).toContain("bg-ground");
    expect(section?.textContent).toBe("body");
  });

  it("adds will-change-opacity after hydration when motion is enabled", () => {
    mockUseReducedMotion.mockReturnValue(false);
    const { container } = render(<SectionTransition>x</SectionTransition>);
    const section = container.querySelector("section") as HTMLElement;
    expect(section.className).toContain("will-change-opacity");
  });

  it("omits will-change-opacity when reduced-motion is set", () => {
    mockUseReducedMotion.mockReturnValue(true);
    const { container } = render(<SectionTransition>x</SectionTransition>);
    const section = container.querySelector("section") as HTMLElement;
    expect(section.className).not.toContain("will-change-opacity");
  });
});
