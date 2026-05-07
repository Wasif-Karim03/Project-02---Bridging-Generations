import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const destroy = vi.fn();
const raf = vi.fn();

vi.mock("lenis", () => ({
  default: class {
    destroy = destroy;
    raf = raf;
  },
}));

import { SmoothScroll } from "@/components/layout/SmoothScroll";

function mockMatchMedia({ reduce, fine }: { reduce: boolean; fine: boolean }) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion")
        ? reduce
        : query.includes("pointer: fine")
          ? fine
          : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

describe("SmoothScroll", () => {
  beforeEach(() => {
    destroy.mockReset();
    raf.mockReset();
  });

  it("skips Lenis setup when prefers-reduced-motion is set", () => {
    mockMatchMedia({ reduce: true, fine: true });
    const { unmount } = render(<SmoothScroll />);
    unmount();
    expect(destroy).not.toHaveBeenCalled();
  });

  it("skips Lenis setup on touch (pointer: coarse) devices", () => {
    mockMatchMedia({ reduce: false, fine: false });
    const { unmount } = render(<SmoothScroll />);
    unmount();
    expect(destroy).not.toHaveBeenCalled();
  });

  it("initializes Lenis and tears it down on unmount", () => {
    mockMatchMedia({ reduce: false, fine: true });
    const { unmount } = render(<SmoothScroll />);
    unmount();
    expect(destroy).toHaveBeenCalledTimes(1);
  });
});
