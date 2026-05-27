// Reusable skeleton primitives for loading.tsx files. Pure CSS pulse,
// uses ground-3 against ground-2 so the placeholder is visible but
// quiet against the page bg.

export function SkeletonBlock({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-ground-3${className ? ` ${className}` : ""}`}
      style={style}
    />
  );
}

export function SkeletonHeader() {
  return (
    <header className="flex flex-col gap-3">
      <SkeletonBlock className="h-4 w-32" />
      <SkeletonBlock className="h-10 w-3/5" />
      <SkeletonBlock className="h-4 w-4/5" />
    </header>
  );
}

export function SkeletonStatTiles({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable placeholder grid
        <SkeletonBlock key={i} className="h-24 border border-hairline" />
      ))}
    </div>
  );
}

export function SkeletonCardGrid({ count = 3, cols = 3 }: { count?: number; cols?: 2 | 3 | 4 }) {
  const colsClass =
    cols === 2 ? "sm:grid-cols-2" : cols === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return (
    <div className={`grid grid-cols-1 gap-4 ${colsClass}`}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: stable placeholder grid
        <SkeletonBlock key={i} className="h-48 border border-hairline" />
      ))}
    </div>
  );
}
