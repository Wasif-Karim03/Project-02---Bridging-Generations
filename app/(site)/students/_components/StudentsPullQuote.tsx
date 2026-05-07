import type { Testimonial } from "@/lib/content/testimonials";

type StudentsPullQuoteProps = {
  testimonial: Testimonial;
};

export function StudentsPullQuote({ testimonial }: StudentsPullQuoteProps) {
  const { quote, speakerName, speakerTitle, speakerRole } = testimonial;
  const role =
    speakerTitle && speakerTitle.length > 0
      ? speakerTitle
      : `${speakerRole.charAt(0).toUpperCase()}${speakerRole.slice(1)}`;

  return (
    <aside aria-label="Student pull quote" className="lg:max-w-[34ch] lg:justify-self-end">
      <figure className="flex flex-col gap-3 border-accent-2-text border-l-2 pl-4 lg:pl-5">
        <blockquote className="text-balance text-body-lg text-ink">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <figcaption className="text-meta uppercase tracking-[0.1em] text-ink-2">
          {speakerName} · {role}
        </figcaption>
      </figure>
    </aside>
  );
}
