import { SectionShell } from "./SectionShell";

const sectionRhythm: Array<{ token: string; px: number; role: string }> = [
  { token: "--space-section-sm", px: 64, role: "Mobile section rhythm" },
  { token: "--space-section-md", px: 96, role: "Desktop default" },
  { token: "--space-section-lg", px: 128, role: "Hero / CTA panels" },
  { token: "--space-section-xl", px: 160, role: "Signature moments" },
];

const stackSet = [16, 24, 32, 40, 56];
const inlineSet = [8, 12, 16, 24];

export function SpacingSection() {
  return (
    <SectionShell
      id="spacing"
      number="§3"
      label="Spacing"
      meta={[
        { key: "rhythm", value: "4 tokens" },
        { key: "grid", value: "4px base" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Section rhythm tokens plus curated stack / inline sets. Consume arbitrary via
        <code className="mx-1 font-mono">var(--space-section-md)</code>
        or via the Tailwind 4px grid for stack and inline.
      </p>

      <div className="mt-10">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">Section rhythm</p>
        <div className="mt-5 flex flex-wrap items-end gap-10">
          {sectionRhythm.map((step) => (
            <div key={step.token} className="flex flex-col">
              <div
                aria-hidden="true"
                className="w-24 border-l-2 border-accent bg-accent/10"
                style={{ height: `${step.px}px` }}
              />
              <p className="mt-3 font-mono text-meta uppercase text-ink">{step.token}</p>
              <p className="font-mono text-meta text-ink-2">{step.px}px</p>
              <p className="max-w-[10rem] text-meta text-ink-2">{step.role}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 border-t border-hairline pt-8">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
          Container gutter
        </p>
        <p className="mt-3 max-w-2xl text-body-sm text-ink-2">
          <code className="font-mono">--space-container-x</code> ={" "}
          <code className="font-mono">clamp(16px, 6vw, 96px)</code>. Tailwind alias:{" "}
          <code className="font-mono">px-4 sm:px-6 lg:px-[6%]</code>. Max content width{" "}
          <code className="font-mono">1280px</code>.
        </p>
      </div>

      <div className="mt-12 grid gap-12 border-t border-hairline pt-8 md:grid-cols-2">
        <div>
          <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
            Stack · vertical
          </p>
          <p className="mt-2 text-body-sm text-ink-2">Pick from this set for component stacks.</p>
          <div className="mt-4 space-y-2">
            {stackSet.map((px) => (
              <div key={px} className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="bg-accent"
                  style={{ height: `${px}px`, width: "4px" }}
                />
                <p className="font-mono text-meta uppercase text-ink">{px}px</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
            Inline · horizontal
          </p>
          <p className="mt-2 text-body-sm text-ink-2">Pick from this set for inline gaps.</p>
          <div className="mt-4 space-y-3">
            {inlineSet.map((px) => (
              <div key={px} className="flex items-center gap-4">
                <div
                  aria-hidden="true"
                  className="bg-accent"
                  style={{ width: `${px}px`, height: "4px" }}
                />
                <p className="font-mono text-meta uppercase text-ink">{px}px</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
