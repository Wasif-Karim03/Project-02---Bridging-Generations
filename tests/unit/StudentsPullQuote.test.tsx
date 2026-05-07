import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudentsPullQuote } from "@/app/(site)/students/_components/StudentsPullQuote";
import type { Testimonial } from "@/lib/content/testimonials";

const base: Testimonial = {
  id: "t",
  quote: "A quote from someone.",
  speakerName: "Anika",
  speakerTitle: "",
  speakerRole: "student",
  speakerPhoto: { src: null, alt: "" },
  highlightWord: "",
};

describe("StudentsPullQuote", () => {
  it("renders the quote and capitalized role when no title is set", () => {
    render(<StudentsPullQuote testimonial={base} />);
    expect(screen.getByRole("blockquote")).toHaveTextContent("A quote from someone.");
    expect(screen.getByText(/Anika · Student/)).toBeInTheDocument();
  });

  it("prefers an explicit speakerTitle over the role fallback", () => {
    render(<StudentsPullQuote testimonial={{ ...base, speakerTitle: "Grade 10, Dighinala" }} />);
    expect(screen.getByText(/Anika · Grade 10, Dighinala/)).toBeInTheDocument();
  });
});
