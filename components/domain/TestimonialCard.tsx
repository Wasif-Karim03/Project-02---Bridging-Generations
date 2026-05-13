import type { ReactNode } from "react";
import type { Testimonial } from "@/lib/content/testimonials";

type SpeakerRole = Testimonial["speakerRole"];
type Scale = "feature" | "row" | "tile";

const SCALE_BY_ROLE: Record<SpeakerRole, Scale> = {
  partner: "feature",
  board: "feature",
  alum: "row",
  donor: "row",
  teacher: "row",
  student: "tile",
  parent: "tile",
  volunteer: "tile",
};

const ROLE_LABELS: Record<SpeakerRole, string> = {
  parent: "Parent",
  teacher: "Teacher",
  student: "Student",
  alum: "Alum",
  board: "Board",
  partner: "Partner",
  volunteer: "Volunteer",
  donor: "Donor",
};

type TestimonialCardProps = {
  testimonial: Testimonial;
  /** Override the role-derived scale — used by tests / one-off compositions. */
  scaleOverride?: Scale;
};

function highlight(quote: string, word: string | null | undefined): ReactNode {
  if (!word) return quote;
  const idx = quote.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return quote;
  return (
    <>
      {quote.slice(0, idx)}
      <mark className="bg-accent-3/40 px-1 text-ink">{quote.slice(idx, idx + word.length)}</mark>
      {quote.slice(idx + word.length)}
    </>
  );
}

export function TestimonialCard({ testimonial, scaleOverride }: TestimonialCardProps) {
  const scale = scaleOverride ?? SCALE_BY_ROLE[testimonial.speakerRole];
  if (scale === "feature") return <FeatureTestimonial t={testimonial} />;
  if (scale === "row") return <RowTestimonial t={testimonial} />;
  return <TileTestimonial t={testimonial} />;
}

function FeatureTestimonial({ t }: { t: Testimonial }) {
  const roleLabel = ROLE_LABELS[t.speakerRole];
  return (
    <blockquote className="relative grid grid-cols-1 gap-6 border-t border-hairline py-12 lg:grid-cols-[1fr_11fr] lg:gap-10 lg:py-16">
      <span
        aria-hidden="true"
        className="font-display text-[88px] leading-[0.6] text-accent-2-text lg:text-[112px]"
      >
        &ldquo;
      </span>
      <div className="flex flex-col gap-6">
        <p className="text-balance text-heading-2 text-ink">
          {highlight(t.quote, t.highlightWord)}
        </p>
        <footer className="flex flex-col gap-1">
          <cite className="text-heading-5 not-italic text-ink">{t.speakerName}</cite>
          {t.speakerTitle ? <span className="text-meta text-ink-2">{t.speakerTitle}</span> : null}
          <span className="text-meta uppercase tracking-[0.08em] text-ink-2">{roleLabel}</span>
        </footer>
      </div>
    </blockquote>
  );
}

function RowTestimonial({ t }: { t: Testimonial }) {
  const roleLabel = ROLE_LABELS[t.speakerRole];
  return (
    <blockquote className="relative grid grid-cols-1 gap-3 border-t border-hairline py-8 lg:py-10">
      <p className="text-balance text-heading-4 text-ink">{highlight(t.quote, t.highlightWord)}</p>
      <footer className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <cite className="text-heading-5 not-italic text-ink">{t.speakerName}</cite>
        {t.speakerTitle ? <span className="text-meta text-ink-2">{t.speakerTitle}</span> : null}
        <span className="ml-auto text-meta uppercase tracking-[0.08em] text-ink-2">
          {roleLabel}
        </span>
      </footer>
    </blockquote>
  );
}

function TileTestimonial({ t }: { t: Testimonial }) {
  const roleLabel = ROLE_LABELS[t.speakerRole];
  return (
    <blockquote className="relative flex flex-col gap-3 border-t border-hairline py-5">
      <p className="text-balance text-body text-ink">{highlight(t.quote, t.highlightWord)}</p>
      <footer className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <cite className="text-meta not-italic text-ink">{t.speakerName}</cite>
        {t.speakerTitle ? <span className="text-meta text-ink-2">{t.speakerTitle}</span> : null}
        <span className="ml-auto text-meta uppercase tracking-[0.08em] text-ink-2">
          {roleLabel}
        </span>
      </footer>
    </blockquote>
  );
}
