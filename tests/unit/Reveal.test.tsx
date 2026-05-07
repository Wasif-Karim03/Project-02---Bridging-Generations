import { render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "@/components/ui/Reveal";

type IntersectionEntryLike = { isIntersecting: boolean };
type IOCallback = (entries: IntersectionEntryLike[]) => void;

let observers: IOCallback[] = [];

class MockIntersectionObserver {
  callback: IOCallback;
  constructor(cb: IOCallback) {
    this.callback = cb;
    observers.push(cb);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  observers = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Reveal", () => {
  it("renders children inside a reveal-on-scroll root", () => {
    const { container } = render(<Reveal>hello</Reveal>);
    const root = container.querySelector(".reveal-on-scroll");
    expect(root).not.toBeNull();
    expect(root).toHaveTextContent("hello");
  });

  it("toggles is-visible when the observer fires", () => {
    const { container } = render(<Reveal>child</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.classList.contains("is-visible")).toBe(false);
    act(() => {
      observers[0]?.([{ isIntersecting: true }]);
    });
    expect(root.classList.contains("is-visible")).toBe(true);
  });

  it("sets data-reveal-stagger when stagger is provided", () => {
    const { container } = render(<Reveal stagger="scale-in">x</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.dataset.revealStagger).toBe("scale-in");
  });

  it("omits data-reveal-stagger when stagger is not provided", () => {
    const { container } = render(<Reveal>x</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.hasAttribute("data-reveal-stagger")).toBe(false);
  });

  it("applies inline transitionDelay when delay is set", () => {
    const { container } = render(<Reveal delay={200}>x</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.style.transitionDelay).toBe("200ms");
  });

  it("cascade wraps each direct child with data-reveal-item and per-index --reveal-delay", () => {
    const { container } = render(
      <Reveal cascade cascadeDelay={150}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </Reveal>,
    );
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.hasAttribute("data-reveal-cascade")).toBe(true);
    const items = root.querySelectorAll("[data-reveal-item]");
    expect(items).toHaveLength(3);
    expect((items[0] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("0ms");
    expect((items[1] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("150ms");
    expect((items[2] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("300ms");
  });

  it("caps cumulative cascade delay at 600ms", () => {
    const { container } = render(
      <Reveal cascade cascadeDelay={200}>
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </Reveal>,
    );
    const items = container.querySelectorAll("[data-reveal-item]");
    expect((items[3] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("600ms");
    expect((items[4] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("600ms");
  });

  it("defaults cascadeDelay to 150ms", () => {
    const { container } = render(
      <Reveal cascade>
        <span>a</span>
        <span>b</span>
      </Reveal>,
    );
    const items = container.querySelectorAll("[data-reveal-item]");
    expect((items[1] as HTMLElement).style.getPropertyValue("--reveal-delay")).toBe("150ms");
  });

  it("does not wrap children in data-reveal-item when cascade is off", () => {
    const { container } = render(
      <Reveal>
        <span>a</span>
        <span>b</span>
      </Reveal>,
    );
    const items = container.querySelectorAll("[data-reveal-item]");
    expect(items).toHaveLength(0);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.hasAttribute("data-reveal-cascade")).toBe(false);
  });

  it("forwards className onto the root", () => {
    const { container } = render(<Reveal className="grid grid-cols-3">x</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.classList.contains("grid")).toBe(true);
    expect(root.classList.contains("grid-cols-3")).toBe(true);
  });

  it("omits data-reveal-kind for the default kind", () => {
    const { container } = render(<Reveal>x</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.hasAttribute("data-reveal-kind")).toBe(false);
  });

  it("emits data-reveal-kind for non-default kinds", () => {
    const { container: develop } = render(<Reveal kind="develop">x</Reveal>);
    expect((develop.querySelector(".reveal-on-scroll") as HTMLElement).dataset.revealKind).toBe(
      "develop",
    );
    const { container: underline } = render(<Reveal kind="draw-underline">x</Reveal>);
    expect((underline.querySelector(".reveal-on-scroll") as HTMLElement).dataset.revealKind).toBe(
      "draw-underline",
    );
    const { container: wrapper } = render(<Reveal kind="count-up-wrapper">x</Reveal>);
    expect((wrapper.querySelector(".reveal-on-scroll") as HTMLElement).dataset.revealKind).toBe(
      "count-up-wrapper",
    );
  });

  it("appends a HandDrawnUnderline with the reveal-underline class for kind='draw-underline'", () => {
    const { container } = render(
      <Reveal kind="draw-underline">
        <h2>Heading</h2>
      </Reveal>,
    );
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    const svg = root.querySelector("svg.reveal-underline");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden", "true");
    // Heading child still renders
    expect(root.querySelector("h2")?.textContent).toBe("Heading");
  });

  it("does not append an underline for other kinds", () => {
    const { container } = render(
      <Reveal kind="develop">
        {/* biome-ignore lint/performance/noImgElement: jsdom test fixture; not a rendered page */}
        <img alt="" src="/x" />
      </Reveal>,
    );
    const svg = container.querySelector("svg.reveal-underline");
    expect(svg).toBeNull();
  });

  it("latches `developed` when the filter transition ends (motion-OK)", () => {
    // Override the default reduced-motion-true matchMedia stub for this test so
    // the effect waits on transitionend instead of latching immediately.
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    const { container } = render(
      <Reveal kind="develop">
        <span data-testid="develop-child" />
      </Reveal>,
    );
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    expect(root.classList.contains("developed")).toBe(false);

    act(() => {
      observers[0]?.([{ isIntersecting: true }]);
    });
    expect(root.classList.contains("is-visible")).toBe(true);
    expect(root.classList.contains("developed")).toBe(false);

    // Fire transitionend for opacity first — should NOT latch (we listen for filter).
    act(() => {
      root.dispatchEvent(new TransitionEvent("transitionend", { propertyName: "opacity" }));
    });
    expect(root.classList.contains("developed")).toBe(false);

    act(() => {
      root.dispatchEvent(new TransitionEvent("transitionend", { propertyName: "filter" }));
    });
    expect(root.classList.contains("developed")).toBe(true);

    window.matchMedia = original;
  });

  it("latches `developed` immediately when prefers-reduced-motion (no transitionend fires)", () => {
    // Default setup matchMedia returns matches=true for reduce.
    const { container } = render(
      <Reveal kind="develop">
        <span data-testid="develop-child" />
      </Reveal>,
    );
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;
    act(() => {
      observers[0]?.([{ isIntersecting: true }]);
    });
    expect(root.classList.contains("developed")).toBe(true);
  });

  it("never adds `developed` for non-develop kinds", () => {
    vi.useFakeTimers();
    const { container } = render(<Reveal>default kind</Reveal>);
    const root = container.querySelector(".reveal-on-scroll") as HTMLElement;

    act(() => {
      observers[0]?.([{ isIntersecting: true }]);
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(root.classList.contains("developed")).toBe(false);

    vi.useRealTimers();
  });
});
