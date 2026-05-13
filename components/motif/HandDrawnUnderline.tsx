type HandDrawnUnderlineProps = {
  className?: string;
};

// Inherits `currentColor` from its text context. `preserveAspectRatio="none"` lets the
// underline stretch when used as a full-width chapter break; natural aspect renders
// cleanly too, so both use cases share one component.
export function HandDrawnUnderline({ className }: HandDrawnUnderlineProps) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
    >
      {/* Main stroke — filled lenticular shape for variable pen-pressure width. */}
      <path
        d="M 4 7 C 50 3, 100 10, 196 5 C 100 8, 50 5, 4 7 Z"
        fill="currentColor"
        opacity="0.92"
      />
      {/* Pen-skip mark — broken trail below suggests the pen bounced once. */}
      <path
        d="M 30 10.5 L 58 10.2 M 82 10.6 L 138 10.3 M 160 10.4 L 184 10.1"
        stroke="currentColor"
        strokeWidth="0.7"
        strokeLinecap="round"
        opacity="0.38"
      />
    </svg>
  );
}
