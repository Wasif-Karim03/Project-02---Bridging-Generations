import { SectionShell } from "./SectionShell";

type Sample = {
  label: string;
  sub: string;
  className: string;
  style?: React.CSSProperties;
};

const samples: Sample[] = [
  {
    label: "Sharp",
    sub: "default · cards, buttons, inputs",
    className: "bg-accent",
    style: { borderRadius: 0 },
  },
  {
    label: "Pill",
    sub: "--radius-full · avatars, status dots, tag pills",
    className: "bg-accent rounded-full",
  },
  {
    label: "Squircle",
    sub: "corner-shape: squircle · chrome 139+",
    className: "bg-accent shape-squircle",
  },
  {
    label: "Scoop",
    sub: "corner-shape: scoop · chrome 139+",
    className: "bg-accent shape-scoop",
  },
  {
    label: "Bevel",
    sub: "corner-shape: bevel · chrome 139+",
    className: "bg-accent shape-bevel",
  },
];

export function ShapeSection() {
  return (
    <SectionShell
      id="shape"
      number="§4"
      label="Shape"
      meta={[
        { key: "samples", value: "5" },
        { key: "chrome", value: "139+" },
        { key: "mode", value: "progressive" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Editorial sharp is the baseline. `--radius-full` stays only for functional circles. The
        `corner-shape` property (Chrome 139+, March 2026) unlocks squircle, scoop, and bevel —
        reserved for the single most important surface per view.
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {samples.map((sample) => (
          <figure key={sample.label} className="flex flex-col gap-4">
            <div
              aria-hidden="true"
              className={`h-28 w-full ${sample.className}`}
              style={sample.style}
            />
            <figcaption>
              <p className="text-heading-6 text-ink">{sample.label}</p>
              <p className="mt-1 font-mono text-meta uppercase text-ink-2">{sample.sub}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-10 max-w-2xl text-body-sm text-ink-2">
        Older browsers render the baseline `border-radius` fallback shown here. Use shape as
        hierarchy — a hero portrait, a marquee CTA — not as decoration.
      </p>
    </SectionShell>
  );
}
