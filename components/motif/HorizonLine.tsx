type HorizonLineProps = {
  className?: string;
  tone?: "on-cream" | "on-teal";
};

// `preserveAspectRatio="none"` stretches this silhouette to the caller's width.
// Consumers must provide an explicit width (e.g. `w-full`) or it collapses to 0.
export function HorizonLine({ className, tone = "on-cream" }: HorizonLineProps) {
  const base = tone === "on-cream" ? "var(--color-accent)" : "#ffffff";
  const farOpacity = tone === "on-cream" ? 0.05 : 0.04;
  const midOpacity = tone === "on-cream" ? 0.1 : 0.08;
  const nearOpacity = tone === "on-cream" ? 0.18 : 0.14;
  const ridgeOpacity = tone === "on-cream" ? 0.55 : 0.42;
  return (
    <svg
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="none"
      className={className}
      style={{ color: base }}
    >
      {/* Far range — the flattest silhouette, nearly lost in the atmosphere. */}
      <path
        d="M 0 82 L 110 74 L 240 80 L 360 68 L 520 76 L 680 70 L 860 78 L 1020 72 L 1180 80 L 1320 74 L 1440 78 L 1440 120 L 0 120 Z"
        fill="currentColor"
        opacity={farOpacity}
      />
      {/* Mid range — sharper peaks, slight asymmetry. */}
      <path
        d="M 0 92 L 90 78 L 180 88 L 300 72 L 440 86 L 580 74 L 740 90 L 900 78 L 1060 92 L 1220 80 L 1360 90 L 1440 84 L 1440 120 L 0 120 Z"
        fill="currentColor"
        opacity={midOpacity}
      />
      {/* Near range — most detail, dominant shape. */}
      <path
        d="M 0 104 L 60 90 L 140 100 L 220 84 L 330 98 L 450 86 L 560 102 L 680 88 L 800 104 L 920 90 L 1060 102 L 1200 88 L 1330 100 L 1440 92 L 1440 120 L 0 120 Z"
        fill="currentColor"
        opacity={nearOpacity}
      />
      {/* Ridge accent — a single hairline traced along the near-range top edge. */}
      <path
        d="M 0 104 L 60 90 L 140 100 L 220 84 L 330 98 L 450 86 L 560 102 L 680 88 L 800 104 L 920 90 L 1060 102 L 1200 88 L 1330 100 L 1440 92"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        opacity={ridgeOpacity}
      />
    </svg>
  );
}
