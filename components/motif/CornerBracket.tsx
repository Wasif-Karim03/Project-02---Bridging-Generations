import type { ReactNode } from "react";

type CornerBracketProps = {
  children: ReactNode;
  className?: string;
};

export function CornerBracket({ children, className }: CornerBracketProps) {
  const bracket = (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="size-5 text-ink-2/50"
    >
      {/* Outer rule — the primary L. */}
      <path
        d="M 2 14 L 2 2 L 14 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        fill="none"
      />
      {/* Inner rule — parallel, 4 units inside. Editorial double-rule feel. */}
      <path
        d="M 6 14 L 6 6 L 14 6"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="square"
        fill="none"
        opacity="0.6"
      />
      {/* Terminal serifs — tiny cross-strokes anchoring the ends. */}
      <path
        d="M 2 14 L 2 16 M 14 2 L 16 2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
  return (
    <div className={`relative ${className ?? ""}`}>
      <span className="pointer-events-none absolute left-2 top-2">{bracket}</span>
      <span className="pointer-events-none absolute right-2 top-2 rotate-90">{bracket}</span>
      <span className="pointer-events-none absolute right-2 bottom-2 rotate-180">{bracket}</span>
      <span className="pointer-events-none absolute left-2 bottom-2 -rotate-90">{bracket}</span>
      {children}
    </div>
  );
}
