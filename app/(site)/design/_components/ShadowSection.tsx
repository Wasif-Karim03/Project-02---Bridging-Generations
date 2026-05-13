import { SectionShell } from "./SectionShell";

const samples: Array<{ token: string; role: string }> = [
  { token: "--shadow-card", role: "Resting card" },
  { token: "--shadow-card-hover", role: "Hovered card, elevated modal" },
  { token: "--shadow-cta", role: "Primary-button coral glow" },
];

export function ShadowSection() {
  return (
    <SectionShell
      id="shadow"
      number="§5"
      label="Elevation"
      meta={[
        { key: "shadows", value: "3" },
        { key: "stacks", value: "flat only" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Three flat shadows. No inner shadows, no multi-layer stacks. The CTA glow leans on coral
        tint to read as a call to action rather than a hover state.
      </p>
      <div className="mt-10 grid gap-10 sm:grid-cols-3">
        {samples.map((sample) => (
          <figure key={sample.token} className="flex flex-col gap-4">
            <div
              aria-hidden="true"
              className="h-28 w-full bg-ground-2"
              style={{ boxShadow: `var(${sample.token})` }}
            />
            <figcaption>
              <p className="font-mono text-meta uppercase text-ink">{sample.token}</p>
              <p className="mt-1 font-mono text-meta uppercase text-ink-2">{sample.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionShell>
  );
}
