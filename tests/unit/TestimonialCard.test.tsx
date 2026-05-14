import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestimonialCard } from "@/components/domain/TestimonialCard";
import type { Testimonial } from "@/lib/content/testimonials";

const sample: Testimonial = {
  id: "jyoti",
  speakerName: "Jyoti Chakma",
  quote: "I was sponsored from grade six until I finished.",
  speakerTitle: "Alumna, primary teacher",
  speakerPhoto: { src: null, alt: "" },
  speakerRole: "alum",
  highlightWord: "",
  quoteBn: "",
  speakerTitleBn: "",
};

describe("TestimonialCard", () => {
  it("renders the quote in a blockquote", () => {
    const { container } = render(<TestimonialCard testimonial={sample} />);
    const bq = container.querySelector("blockquote");
    expect(bq).not.toBeNull();
    expect(bq).toHaveTextContent(sample.quote);
  });

  it("renders the speaker name via <cite>", () => {
    const { container } = render(<TestimonialCard testimonial={sample} />);
    const cite = container.querySelector("cite");
    expect(cite).toHaveTextContent("Jyoti Chakma");
  });

  it("renders the speaker title and role label", () => {
    render(<TestimonialCard testimonial={sample} />);
    expect(screen.getByText("Alumna, primary teacher")).toBeInTheDocument();
    expect(screen.getByText("Alum")).toBeInTheDocument();
  });

  it("omits speaker title when not provided", () => {
    render(<TestimonialCard testimonial={{ ...sample, speakerTitle: "" }} />);
    expect(screen.queryByText("Alumna, primary teacher")).toBeNull();
  });
});
