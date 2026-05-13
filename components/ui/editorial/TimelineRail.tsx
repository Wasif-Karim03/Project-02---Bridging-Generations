import type { ReactNode } from "react";

type TimelineRailProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

// Semantic timeline. Replaces the audit's "<ul> with aria-label timeline"
// failure mode with an actual ordered list. Month dividers mark temporal
// boundaries; entries carry their relative-time stamp in the eyebrow slot.
function TimelineRailRoot({ children, className, ariaLabel }: TimelineRailProps) {
  const base = "relative";
  const merged = `${base} ${className ?? ""}`.trim();
  return (
    <ol className={merged} aria-label={ariaLabel}>
      {children}
    </ol>
  );
}

type MonthDividerProps = {
  label: string;
};

function TimelineRailMonthDivider({ label }: MonthDividerProps) {
  return (
    <li aria-hidden="true" className="relative flex items-center gap-3 py-6 first:pt-0">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-3" />
      <span className="text-meta uppercase tracking-[0.16em] text-ink">{label}</span>
      <span className="ml-2 h-px flex-1 bg-hairline" />
    </li>
  );
}

type EntryProps = {
  children: ReactNode;
  className?: string;
};

function TimelineRailEntry({ children, className }: EntryProps) {
  const base = "block";
  const merged = `${base} ${className ?? ""}`.trim();
  return <li className={merged}>{children}</li>;
}

export const TimelineRail = Object.assign(TimelineRailRoot, {
  MonthDivider: TimelineRailMonthDivider,
  Entry: TimelineRailEntry,
});
