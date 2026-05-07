import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollProgressRule } from "@/components/layout/ScrollProgressRule";

function setMatchMedia(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("reduce") ? reduce : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function setSupportsScrollTimeline(supported: boolean) {
  vi.stubGlobal("CSS", {
    supports: (property: string, value: string) =>
      supported && property === "animation-timeline" && value === "scroll(root)",
  });
}

describe("ScrollProgressRule", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders aria-hidden, origin-left, and the scroll-progress-rule class", () => {
    setSupportsScrollTimeline(true);
    const { container } = render(<ScrollProgressRule />);
    const rule = container.querySelector("div");
    expect(rule).not.toBeNull();
    expect(rule).toHaveAttribute("aria-hidden", "true");
    expect(rule).toHaveClass("scroll-progress-rule");
    expect(rule).toHaveClass("origin-left");
    expect(rule).toHaveClass("fixed");
    expect(rule).toHaveClass("top-16");
  });

  it("skips the JS path when the browser supports animation-timeline", () => {
    setSupportsScrollTimeline(true);
    setMatchMedia(false);
    const addSpy = vi.spyOn(window, "addEventListener");
    render(<ScrollProgressRule />);
    const scrollCalls = addSpy.mock.calls.filter(([type]) => type === "scroll");
    expect(scrollCalls).toHaveLength(0);
  });

  describe("without animation-timeline support", () => {
    beforeEach(() => {
      setSupportsScrollTimeline(false);
    });

    it("paints the end state under reduced motion without attaching a scroll listener", () => {
      setMatchMedia(true);
      const addSpy = vi.spyOn(window, "addEventListener");
      const { container } = render(<ScrollProgressRule />);
      const rule = container.querySelector("div") as HTMLDivElement;
      expect(rule.style.transform).toBe("scaleX(1)");
      const scrollCalls = addSpy.mock.calls.filter(([type]) => type === "scroll");
      expect(scrollCalls).toHaveLength(0);
    });

    it("attaches a passive scroll listener when motion is allowed", () => {
      setMatchMedia(false);
      const addSpy = vi.spyOn(window, "addEventListener");
      render(<ScrollProgressRule />);
      const scrollCalls = addSpy.mock.calls.filter(([type]) => type === "scroll");
      expect(scrollCalls).toHaveLength(1);
      const options = scrollCalls[0]?.[2];
      expect(options).toEqual(expect.objectContaining({ passive: true }));
    });
  });
});
