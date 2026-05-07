type TealPaperclipProps = {
  className?: string;
};

export function TealPaperclip({ className }: TealPaperclipProps) {
  return (
    <svg
      viewBox="0 0 24 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ color: "var(--color-accent)" }}
    >
      <defs>
        {/* Metallic sheen — brighter on the light-facing side, deeper on the shadow side. */}
        <linearGradient id="motif-clip-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="45%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.78" />
        </linearGradient>
      </defs>
      <g transform="rotate(6 12 20)">
        {/* Drop shadow under the clip — suggests 3D placement on the page. */}
        <path
          d="M 7 6 L 7 29 A 5 5 0 0 0 18 29 L 18 11 A 3.6 3.6 0 0 0 11 11 L 11 27"
          stroke="#000000"
          strokeOpacity="0.14"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          transform="translate(0.8 1.2)"
        />
        {/* The clip itself — stroke painted by the metallic gradient. */}
        <path
          d="M 6 4 L 6 28 A 6 6 0 0 0 18 28 L 18 10 A 4 4 0 0 0 10 10 L 10 26"
          stroke="url(#motif-clip-sheen)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Highlight — a short bright stroke on the outer upper curve. */}
        <path
          d="M 7.2 6 L 7.2 14"
          stroke="currentColor"
          strokeOpacity="0.28"
          strokeWidth="0.8"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
