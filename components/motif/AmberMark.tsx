type AmberMarkProps = {
  className?: string;
};

// `preserveAspectRatio="none"` stretches this motif to the caller's className width.
// Consumers must provide an explicit width (e.g. `w-full`) or it collapses to 0.
export function AmberMark({ className }: AmberMarkProps) {
  return (
    <svg
      viewBox="0 0 400 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
      style={{ color: "var(--color-accent-3)" }}
    >
      <defs>
        {/* Fade opacity at both ends — highlighter feathering, no hard rect edges. */}
        <linearGradient id="motif-amber-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="6%" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="50%" stopColor="currentColor" stopOpacity="0.52" />
          <stop offset="94%" stopColor="currentColor" stopOpacity="0.38" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Main swipe — path with slight top/bottom wobble; skewed for marker-stroke diagonal. */}
      <path
        d="M 2 2.4 Q 100 1.6, 200 2.2 T 398 2 L 398 11.6 Q 300 12.6, 200 11.8 T 2 11.6 Z"
        fill="url(#motif-amber-fade)"
        transform="skewX(-3)"
      />
      {/* Reload stripe — thinner secondary pass, offset up. Mimics marker re-dipped. */}
      <rect
        x="20"
        y="3"
        width="360"
        height="2.6"
        fill="currentColor"
        opacity="0.22"
        transform="skewX(-3)"
      />
    </svg>
  );
}
