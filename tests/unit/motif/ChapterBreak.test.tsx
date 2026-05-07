import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChapterBreak } from "@/components/motif/ChapterBreak";

describe("ChapterBreak", () => {
  it("renders a chapter-break wrapper with aria-hidden", () => {
    const { container } = render(<ChapterBreak />);
    const wrapper = container.querySelector(".chapter-break");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the HandDrawnUnderline svg with the chapter-break__mark class", () => {
    const { container } = render(<ChapterBreak />);
    const mark = container.querySelector("svg.chapter-break__mark");
    expect(mark).toBeInTheDocument();
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveAttribute("preserveAspectRatio", "none");
  });

  it("starts without the is-visible class", () => {
    // jsdom has no IntersectionObserver — visibility never flips, so initial state is hidden.
    const { container } = render(<ChapterBreak />);
    expect(container.querySelector(".chapter-break.is-visible")).toBeNull();
  });

  it("flips to is-visible when the IntersectionObserver fires", async () => {
    type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
    const observers: ObserverCallback[] = [];
    const disconnect = vi.fn();
    class MockObserver {
      callback: ObserverCallback;
      constructor(cb: ObserverCallback) {
        this.callback = cb;
        observers.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect;
    }
    const original = globalThis.IntersectionObserver;
    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: MockObserver,
    });

    const { container, rerender } = render(<ChapterBreak />);
    expect(container.querySelector(".chapter-break.is-visible")).toBeNull();

    // Fire the observer to simulate the section entering the viewport, then re-render.
    for (const cb of observers) {
      cb([{ isIntersecting: true }]);
    }
    rerender(<ChapterBreak />);

    expect(container.querySelector(".chapter-break.is-visible")).not.toBeNull();
    expect(disconnect).toHaveBeenCalled();

    Object.defineProperty(globalThis, "IntersectionObserver", {
      configurable: true,
      writable: true,
      value: original,
    });
  });
});
