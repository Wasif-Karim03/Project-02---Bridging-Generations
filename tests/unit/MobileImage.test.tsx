import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: next/image stubbed for jsdom tests
    <img alt={alt} src={typeof src === "string" ? src : ""} />
  ),
}));

import { MobileImage } from "@/components/ui/MobileImage";

describe("MobileImage", () => {
  it("renders an <img> with the provided src/alt", () => {
    const { container } = render(<MobileImage src="/test.jpg" alt="test alt" ladder="portrait" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")).toBe("test alt");
  });

  it("applies the mobile-aspect-portrait wrapper class", () => {
    const { container } = render(<MobileImage src="/test.jpg" alt="x" ladder="portrait" />);
    expect(container.firstElementChild?.className).toMatch(/mobile-aspect-portrait/);
  });

  it("applies the mobile-aspect-square wrapper class for ladder='square'", () => {
    const { container } = render(<MobileImage src="/test.jpg" alt="x" ladder="square" />);
    expect(container.firstElementChild?.className).toMatch(/mobile-aspect-square/);
  });

  it("interpolates focal point into wrapper inline style for mobile", () => {
    const { container } = render(
      <MobileImage src="/test.jpg" alt="x" ladder="portrait" mobileFocalPoint={{ x: 40, y: 25 }} />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--mobile-fp-x")).toBe("40%");
    expect(wrapper.style.getPropertyValue("--mobile-fp-y")).toBe("25%");
  });

  it("falls back to {x:50, y:30} when mobileFocalPoint is null/undefined", () => {
    const { container } = render(<MobileImage src="/test.jpg" alt="x" ladder="portrait" />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.getPropertyValue("--mobile-fp-x")).toBe("50%");
    expect(wrapper.style.getPropertyValue("--mobile-fp-y")).toBe("30%");
  });
});
