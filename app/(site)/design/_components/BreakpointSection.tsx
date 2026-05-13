import { SectionShell } from "./SectionShell";

const breakpoints: Array<{ prefix: string; minWidth: string; intent: string }> = [
  { prefix: "(base)", minWidth: "0", intent: "Mobile" },
  { prefix: "sm:", minWidth: "640px", intent: "Large phone / small tablet portrait" },
  { prefix: "md:", minWidth: "768px", intent: "Tablet" },
  { prefix: "lg:", minWidth: "1024px", intent: "Laptop" },
  { prefix: "xl:", minWidth: "1280px", intent: "Desktop" },
  { prefix: "2xl:", minWidth: "1536px", intent: "Wide" },
];

export function BreakpointSection() {
  return (
    <SectionShell
      id="breakpoint"
      number="§13"
      label="Breakpoint"
      meta={[
        { key: "strategy", value: "mobile-first" },
        { key: "min", value: "320px" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Tailwind defaults, mobile-first. The live indicator sits bottom-right on every{" "}
        <code className="font-mono">/design</code> view. Design targets: 375 · 768 · 1280 · 1440 ·
        1920. Must stay usable at 320px.
      </p>
      <div className="mt-10 font-mono text-meta uppercase">
        {breakpoints.map((bp) => (
          <div
            key={bp.prefix}
            className="grid grid-cols-12 gap-4 border-t border-hairline py-3 first:border-t-0 first:pt-0"
          >
            <span className="col-span-3 text-ink">{bp.prefix}</span>
            <span className="col-span-3 text-ink-2">{bp.minWidth}</span>
            <span className="col-span-6 text-ink-2">{bp.intent}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
