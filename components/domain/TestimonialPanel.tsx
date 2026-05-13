import { AmberMark } from "@/components/motif/AmberMark";
import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";
import { Button } from "@/components/ui/Button";
import type { Testimonial } from "@/lib/content/testimonials";

type TestimonialPanelProps = {
  testimonial: Testimonial;
  ctaLabel?: string;
  ctaHref?: string;
  titleId?: string;
  id?: string;
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitForHighlight(
  quote: string,
  word: string | undefined,
): { before: string; match: string; after: string } | null {
  const trimmed = word?.trim();
  if (!trimmed) return null;
  const regex = new RegExp(`\\b${escapeRegex(trimmed)}\\b`, "i");
  const match = quote.match(regex);
  if (!match || match.index === undefined) return null;
  return {
    before: quote.slice(0, match.index),
    match: match[0],
    after: quote.slice(match.index + match[0].length),
  };
}

export function TestimonialPanel({
  testimonial,
  ctaLabel = "Join our mission",
  ctaHref = "/donate",
  titleId = "testimonial-title",
  id,
}: TestimonialPanelProps) {
  const { quote, speakerName, speakerTitle, speakerRole, highlightWord } = testimonial;
  const role =
    speakerTitle && speakerTitle.length > 0
      ? speakerTitle
      : `${speakerRole.charAt(0).toUpperCase()}${speakerRole.slice(1)}`;
  const highlight = splitForHighlight(quote, highlightWord);

  return (
    <section
      aria-labelledby={titleId}
      {...(id ? { id } : {})}
      className={`teal-panel py-20 lg:py-32${id ? " scroll-mt-20" : ""}`}
    >
      <span aria-hidden="true" className="teal-panel-glyph" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <blockquote className="flex flex-col gap-10">
          <p id={titleId} className="text-balance text-heading-1 text-white">
            <span aria-hidden="true" className="testimonial-quote-mark">
              &ldquo;
            </span>
            {highlight ? (
              <>
                {highlight.before}
                <span className="testimonial-highlight">
                  <AmberMark className="testimonial-highlight__bg" />
                  {highlight.match}
                </span>
                {highlight.after}
              </>
            ) : (
              quote
            )}
            <span aria-hidden="true" className="testimonial-quote-mark">
              &rdquo;
            </span>
          </p>
          <footer className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <cite className="not-italic text-heading-5 text-white">{speakerName}</cite>
              <HandDrawnUnderline className="testimonial-speaker-underline mt-1 h-3 w-[clamp(96px,40%,140px)] text-white" />
              <span className="text-meta uppercase text-white/75">{role}</span>
            </div>
            <Button variant="primary" href={ctaHref}>
              {ctaLabel}
            </Button>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
