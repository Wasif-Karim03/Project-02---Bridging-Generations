import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StickyCTA } from "@/components/ui/StickyCTA";

describe("StickyCTA", () => {
  it("renders children", () => {
    render(
      <StickyCTA>
        <a href="/donate">Donate</a>
      </StickyCTA>,
    );
    expect(screen.getByRole("link", { name: "Donate" })).toBeInTheDocument();
  });

  it("uses position: sticky", () => {
    const { container } = render(
      <StickyCTA>
        <span>x</span>
      </StickyCTA>,
    );
    const root = container.firstElementChild as HTMLElement;
    // jsdom may return empty for computed styles; check className for the sticky class as fallback
    const cs = window.getComputedStyle(root);
    expect(cs.position === "sticky" || /(\b|^)sticky(\b|$)/.test(root.className)).toBe(true);
  });

  it("respects safe-area-inset-bottom via CSS env()", () => {
    const { container } = render(
      <StickyCTA>
        <span>x</span>
      </StickyCTA>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.paddingBottom || root.className).toMatch(/safe-area-inset-bottom|env\(/);
  });

  it("applies the mobile-only display class (hidden at sm:+)", () => {
    const { container } = render(
      <StickyCTA>
        <span>x</span>
      </StickyCTA>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/sm:hidden|md:hidden|hidden\s+sm:/);
  });
});
