import type { ReactNode } from "react";

type StickyCTAProps = {
  children: ReactNode;
  /** Optional className appended to the root. */
  className?: string;
  /** Aria label describing the CTA region (e.g. "Primary donate action"). */
  "aria-label"?: string;
};

/**
 * Mobile-only sticky-bottom CTA bar. Hidden at sm: and above.
 *
 * The wrapper provides:
 * - sticky positioning at the viewport bottom
 * - safe-area-inset-bottom padding for iPhone home indicator
 * - backdrop-blur over the underlying scroll
 * - hides automatically when an input inside the document tree has focus
 *   (avoids the bar overlapping the on-screen keyboard)
 *
 * Children control the actual CTA shape (button, link, ledger).
 */
export function StickyCTA({ children, className, ...rest }: StickyCTAProps) {
  return (
    <section
      aria-label={rest["aria-label"] ?? "Sticky call to action"}
      className={[
        "sticky bottom-0 z-40 sm:hidden",
        "bg-ground/85 backdrop-blur-xl",
        "border-t border-hairline",
        "px-4 pt-3",
        // Honor iPhone home-indicator safe area; floor at 0.75rem.
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        // Hide when any descendant of <body> has focus on a form input
        "[body:has(input:focus,textarea:focus,select:focus)_&]:hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </section>
  );
}
