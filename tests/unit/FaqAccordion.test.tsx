import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqAccordion } from "@/components/domain/FaqAccordion";

const items = [
  { question: "Is my donation tax-deductible?", answer: "Yes — 501(c)(3)." },
  { question: "Can I cancel?", answer: "Any time, from your receipt." },
];

describe("FaqAccordion", () => {
  it("renders each question as a collapsed details/summary by default", () => {
    const { container } = render(<FaqAccordion items={items} />);
    const detailsEls = container.querySelectorAll("details");
    expect(detailsEls.length).toBe(items.length);
    for (const el of detailsEls) expect(el.hasAttribute("open")).toBe(false);
  });

  it("renders the question text and answer text for every item", () => {
    render(<FaqAccordion items={items} />);
    expect(screen.getByText("Is my donation tax-deductible?")).toBeInTheDocument();
    expect(screen.getByText("Yes — 501(c)(3).")).toBeInTheDocument();
    expect(screen.getByText("Can I cancel?")).toBeInTheDocument();
  });

  it("renders nothing when the list is empty", () => {
    const { container } = render(<FaqAccordion items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
