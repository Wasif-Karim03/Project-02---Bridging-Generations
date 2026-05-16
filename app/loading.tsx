// Top-level loading boundary. Shown during initial route fetches before the
// page's server components resolve. Sub-routes can ship their own loading.tsx
// for finer skeletons; this is the generic fallback.

export default function GlobalLoading() {
  return (
    <main
      className="mx-auto flex min-h-[40vh] w-full max-w-[1280px] flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
      aria-busy="true"
    >
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Loading…</p>
      <div className="h-10 w-3/4 max-w-[28ch] animate-pulse bg-hairline" />
      <div className="h-5 w-full max-w-[60ch] animate-pulse bg-hairline" />
      <div className="h-5 w-5/6 max-w-[60ch] animate-pulse bg-hairline" />
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="h-32 animate-pulse bg-hairline" />
        <div className="h-32 animate-pulse bg-hairline" />
        <div className="h-32 animate-pulse bg-hairline" />
      </div>
    </main>
  );
}
