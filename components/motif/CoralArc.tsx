type CoralArcProps = {
  className?: string;
  tone?: "accent-2" | "accent";
};

export function CoralArc({ className, tone = "accent-2" }: CoralArcProps) {
  return (
    <svg
      viewBox="0 0 280 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ color: tone === "accent-2" ? "var(--color-accent-2)" : "var(--color-accent)" }}
    >
      {/* Ghost first pass — pen laid down lightly, slightly above the committed mark. */}
      <path
        d="M 8 28 C 64 10, 208 10, 270 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.32"
      />
      {/* Committed stroke — filled lenticular shape for variable pressure weight:
          fattens through the belly of the arc, tapers at both ends. */}
      <path
        d="M 4 32 C 70 8, 210 8, 276 30 C 212 14, 70 14, 4 32 Z"
        fill="currentColor"
        opacity="0.94"
      />
      {/* Ink pool at the terminal — a small thickening where the pen lifted. */}
      <circle cx="276" cy="30" r="2.2" fill="currentColor" opacity="0.78" />
    </svg>
  );
}
