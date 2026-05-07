type ProgressBarProps = {
  percentage: number;
  label?: string;
  tone?: "default" | "funded" | "paused";
  className?: string;
};

export function ProgressBar({ percentage, label, tone = "default", className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const isPaused = tone === "paused";
  const isFunded = !isPaused && (tone === "funded" || clamped >= 100);
  const displayLabel = isFunded ? "Fully funded — thank you" : isPaused ? "Paused" : label;
  const accessibleLabel = displayLabel ?? `${clamped} percent funded`;
  const fillWidth = isFunded ? 100 : clamped;
  const fillClass = isPaused ? "bg-ink-2/40" : "bg-accent";
  const labelClass = isFunded ? "text-accent" : isPaused ? "text-ink-2" : undefined;

  return (
    <div className={className}>
      {displayLabel && (
        <div className="mb-2 flex items-baseline justify-between text-body-sm">
          <span className={labelClass}>{displayLabel}</span>
          {!isFunded && !isPaused && <span className="text-ink-2">{clamped}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isFunded ? 100 : clamped}
        aria-label={accessibleLabel}
        className="relative h-2 w-full bg-hairline"
      >
        <div
          className={`absolute top-0 left-0 h-full ${fillClass}`}
          style={{ width: `${fillWidth}%` }}
        />
        {!isFunded && !isPaused && clamped > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-2"
            style={{ left: `${clamped}%` }}
          />
        )}
      </div>
    </div>
  );
}
