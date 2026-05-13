export function BreakpointIndicator() {
  return (
    <div
      role="status"
      aria-label="Current breakpoint"
      className="fixed right-4 bottom-4 z-50 bg-ink px-3 py-1 font-mono text-meta text-white shadow-[var(--shadow-card)]"
    >
      <span className="sm:hidden">base · &lt;640</span>
      <span className="hidden sm:inline md:hidden">sm · ≥640</span>
      <span className="hidden md:inline lg:hidden">md · ≥768</span>
      <span className="hidden lg:inline xl:hidden">lg · ≥1024</span>
      <span className="hidden xl:inline 2xl:hidden">xl · ≥1280</span>
      <span className="hidden 2xl:inline">2xl · ≥1536</span>
    </div>
  );
}
