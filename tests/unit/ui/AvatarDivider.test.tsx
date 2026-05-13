import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "@/components/ui/Avatar";
import { Divider } from "@/components/ui/Divider";

describe("Avatar", () => {
  it("renders an img with alt when src is provided", () => {
    render(<Avatar src="/portrait.jpg" alt="Amina" size="md" />);
    const img = screen.getByRole("img", { name: "Amina" }) as HTMLImageElement;
    expect(img.tagName).toBe("IMG");
    expect(img.src).toContain("/portrait.jpg");
    expect(img.width).toBe(48);
  });

  it("derives two-letter initials from a full name", () => {
    render(<Avatar name="Amina Begum" size="md" />);
    expect(screen.getByRole("img", { name: "Amina Begum" })).toHaveTextContent("AB");
  });

  it("falls back to two letters of a single name", () => {
    render(<Avatar name="Ishita" size="lg" />);
    expect(screen.getByRole("img", { name: "Ishita" })).toHaveTextContent("IS");
  });

  it("renders aria-hidden when neither src nor name is supplied", () => {
    const { container } = render(<Avatar size="sm" />);
    const span = container.querySelector("span");
    expect(span?.getAttribute("aria-hidden")).toBe("true");
    expect(span?.getAttribute("role")).toBeNull();
  });
});

describe("Divider", () => {
  it("renders an hr with hairline border", () => {
    const { container } = render(<Divider />);
    const hr = container.querySelector("hr");
    expect(hr).not.toBeNull();
    expect(hr?.className).toContain("border-hairline");
  });

  it("applies spacing classes", () => {
    const { container } = render(<Divider spacing="md" />);
    expect(container.querySelector("hr")?.className).toContain("my-8");
  });
});
