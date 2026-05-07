import { SectionShell } from "./SectionShell";

type Swatch = {
  token: string;
  hex: string;
  role: string;
  textSafe: boolean;
  notes?: string;
};

const surfaces: Swatch[] = [
  {
    token: "--color-ground",
    hex: "#F5F1EA",
    role: "Default page background. Warm cream.",
    textSafe: true,
  },
  {
    token: "--color-ground-2",
    hex: "#FFFFFF",
    role: "Elevated surfaces — cards, modals, embedded media frames.",
    textSafe: true,
  },
  {
    token: "--color-ground-3",
    hex: "#EFE7D8",
    role: "Muted surface — alternating section bands, pull-quote panels.",
    textSafe: true,
  },
];

const inks: Swatch[] = [
  {
    token: "--color-ink",
    hex: "#1E1E1E",
    role: "Primary text on light surfaces.",
    textSafe: true,
    notes: "14.7:1 on ground — AAA",
  },
  {
    token: "--color-ink-2",
    hex: "#5C5C5C",
    role: "Secondary text, meta, captions.",
    textSafe: true,
    notes: "6.1:1 on ground — AA body",
  },
];

const lines: Swatch[] = [
  {
    token: "--color-hairline",
    hex: "#DDD6C7",
    role: "1px rules, subtle dividers. Never used as text.",
    textSafe: false,
  },
];

const accents: Swatch[] = [
  {
    token: "--color-accent",
    hex: "#0F4C5C",
    role: "Deep teal. Links, eyebrows, identity color.",
    textSafe: true,
    notes: "9.1:1 on ground — AAA",
  },
  {
    token: "--color-accent-2",
    hex: "#E76F51",
    role: "Coral. Primary-button fill, live dots, emphasis accents.",
    textSafe: false,
    notes: "2.1:1 on ground — non-text only",
  },
  {
    token: "--color-accent-2-text",
    hex: "#B5462B",
    role: "Darkened coral for typography (errors, inline accents).",
    textSafe: true,
    notes: "4.8:1 on ground — AA body",
  },
  {
    token: "--color-accent-3",
    hex: "#FFB84D",
    role: "Amber. Active-nav on teal, highlights.",
    textSafe: false,
    notes: "1.7:1 on ground — non-text only",
  },
];

function SwatchRow({ swatch }: { swatch: Swatch }) {
  return (
    <div className="grid grid-cols-12 items-center gap-4 border-t border-hairline py-5 first:border-t-0 first:pt-0">
      <div
        aria-hidden="true"
        className="col-span-12 h-20 sm:col-span-3 sm:h-16"
        style={{ backgroundColor: `var(${swatch.token})` }}
      />
      <div className="col-span-12 sm:col-span-4">
        <p className="font-mono text-meta uppercase text-ink">{swatch.token}</p>
        <p className="font-mono text-body-sm text-ink-2">{swatch.hex}</p>
      </div>
      <p className="col-span-12 text-body-sm text-ink-2 sm:col-span-3">{swatch.role}</p>
      <p
        className={`col-span-12 font-mono text-meta uppercase sm:col-span-2 ${
          swatch.textSafe ? "text-accent" : "text-accent-2-text"
        }`}
      >
        {swatch.textSafe ? "text-safe" : "non-text"}
        {swatch.notes ? ` · ${swatch.notes}` : ""}
      </p>
    </div>
  );
}

function Group({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <div>
      <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">{title}</p>
      <div className="mt-3">
        {swatches.map((swatch) => (
          <SwatchRow key={swatch.token} swatch={swatch} />
        ))}
      </div>
    </div>
  );
}

export function ColorSection() {
  return (
    <SectionShell
      id="color"
      number="§1"
      label="Color"
      meta={[
        { key: "tokens", value: "10" },
        { key: "wcag", value: "aa" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Three surface tiers, two inks, one hairline, four accents. Contrast notes reference
        DESIGN-SYSTEM.md §1 verified pairings.
      </p>
      <div className="mt-10 space-y-12">
        <Group title="Surface" swatches={surfaces} />
        <Group title="Ink" swatches={inks} />
        <Group title="Line" swatches={lines} />
        <Group title="Accent" swatches={accents} />
      </div>
    </SectionShell>
  );
}
