import type { ReactNode } from "react";

type AccordionProps = {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Optional className appended to the <details> root. */
  className?: string;
};

/**
 * Native <details>/<summary> accordion with editorial styling.
 *
 * Used by the Footer at <sm to collapse link clusters; by /design as a
 * TOC pattern. Native semantics give keyboard accessibility (Enter or
 * Space toggles) for free; no JS state, no ARIA gymnastics.
 *
 * The summary is an editorial label (e.g. "Explore", "In this document");
 * children are the body. Wrap usage at the call site with `sm:hidden`
 * if the desktop layout differs.
 */
export function Accordion({ summary, children, defaultOpen = false, className }: AccordionProps) {
  return (
    <details
      open={defaultOpen}
      className={["group border-b border-hairline last:border-b-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      <summary
        className={[
          "list-none cursor-pointer select-none",
          "flex items-center justify-between gap-3 py-4",
          "text-eyebrow uppercase tracking-[0.16em] text-accent-2-text",
          "[&::-webkit-details-marker]:hidden",
        ].join(" ")}
      >
        <span>{summary}</span>
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pb-4">{children}</div>
    </details>
  );
}
