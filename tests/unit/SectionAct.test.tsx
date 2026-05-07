import { render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SectionAct } from "@/components/ui/SectionAct";

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

describe("SectionAct", () => {
  it("renders children inside a <section> with the section-act class", () => {
    const { container } = render(
      <SectionAct>
        <h2>Heading</h2>
      </SectionAct>,
    );
    const section = container.querySelector("section");
    expect(section).not.toBeNull();
    expect(section?.classList.contains("section-act")).toBe(true);
    expect(section?.querySelector("h2")?.textContent).toBe("Heading");
  });

  it("does not have is-visible until the observer fires", () => {
    const { container } = render(
      <SectionAct>
        <h2>x</h2>
      </SectionAct>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section.classList.contains("is-visible")).toBe(false);
  });

  it("toggles is-visible when the observer reports intersection", () => {
    const { container } = render(
      <SectionAct>
        <h2>x</h2>
      </SectionAct>,
    );
    const section = container.querySelector("section") as HTMLElement;
    act(() => {
      observers[0]?.([{ isIntersecting: true }]);
    });
    expect(section.classList.contains("is-visible")).toBe(true);
  });

  it("merges className onto the root", () => {
    const { container } = render(
      <SectionAct className="mt-12">
        <h2>x</h2>
      </SectionAct>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section.classList.contains("section-act")).toBe(true);
    expect(section.classList.contains("mt-12")).toBe(true);
  });

  it("forwards id onto the root for in-page anchors", () => {
    const { container } = render(
      <SectionAct id="evidence">
        <h2>x</h2>
      </SectionAct>,
    );
    const section = container.querySelector("section") as HTMLElement;
    expect(section.id).toBe("evidence");
  });
});
