import { SectionShell } from "./SectionShell";

type Tier = {
  name: string;
  desktopPx: number;
  mobilePx: number;
  weight: 400 | 500 | 600 | 700;
  lineHeight: number;
  tracking: string;
  usage: string;
  sample: string;
  italic?: boolean;
  note?: string;
};

const tiers: Tier[] = [
  {
    name: "display-1",
    desktopPx: 88,
    mobilePx: 44,
    weight: 700,
    lineHeight: 1.05,
    tracking: "-0.02em",
    usage: "Full-width landing heroes (homepage, /about, /donate)",
    sample: "Bridging generations",
  },
  {
    name: "display-2",
    desktopPx: 64,
    mobilePx: 36,
    weight: 700,
    lineHeight: 1.05,
    tracking: "-0.02em",
    usage: "Narrow / two-column heroes + /blog/[slug] H1",
    sample: "Sponsor a student",
  },
  {
    name: "heading-1",
    desktopPx: 48,
    mobilePx: 40,
    weight: 700,
    lineHeight: 1.1,
    tracking: "-0.01em",
    usage: "Teal-panel testimonial",
    sample: "Our students shape their futures",
  },
  {
    name: "heading-2",
    desktopPx: 40,
    mobilePx: 32,
    weight: 700,
    lineHeight: 1.1,
    tracking: "normal",
    usage: "Section titles",
    sample: "Our programs",
  },
  {
    name: "heading-3",
    desktopPx: 32,
    mobilePx: 28,
    weight: 700,
    lineHeight: 1.2,
    tracking: "normal",
    usage: "Sub-section titles, school names",
    sample: "Partner school names",
  },
  {
    name: "heading-4",
    desktopPx: 28,
    mobilePx: 24,
    weight: 600,
    lineHeight: 1.2,
    tracking: "normal",
    usage: "Program card titles",
    sample: "School meal program",
  },
  {
    name: "heading-5",
    desktopPx: 22,
    mobilePx: 20,
    weight: 600,
    lineHeight: 1.2,
    tracking: "normal",
    usage: "Card titles",
    sample: "Teacher training",
  },
  {
    name: "heading-6",
    desktopPx: 20,
    mobilePx: 18,
    weight: 600,
    lineHeight: 1.3,
    tracking: "normal",
    usage: "Small card titles, side panels",
    sample: "Side panel title",
  },
  {
    name: "body-lg",
    desktopPx: 20,
    mobilePx: 18,
    weight: 400,
    lineHeight: 1.6,
    tracking: "normal",
    usage: "Hero subhead, About intro",
    sample: "We sponsor 156 students across our partner schools in the Chittagong Hill Tracts.",
  },
  {
    name: "body",
    desktopPx: 17,
    mobilePx: 16,
    weight: 400,
    lineHeight: 1.7,
    tracking: "normal",
    usage: "Default body copy",
    sample:
      "Default body copy. Measures cap at about sixty-five characters, tuned for reading comfort on the warm-cream ground.",
  },
  {
    name: "body-sm",
    desktopPx: 15,
    mobilePx: 14,
    weight: 400,
    lineHeight: 1.6,
    tracking: "normal",
    usage: "Card excerpts",
    sample: "Short excerpt text used inside cards and narrow columns.",
  },
  {
    name: "meta",
    desktopPx: 13,
    mobilePx: 13,
    weight: 500,
    lineHeight: 1.4,
    tracking: "0.02em",
    usage: "Dates, captions, metadata",
    sample: "Posted 2026-04-22 · 3 min read",
  },
  {
    name: "eyebrow",
    desktopPx: 12,
    mobilePx: 12,
    weight: 500,
    lineHeight: 1,
    tracking: "0.1em",
    usage: "Uppercase eyebrow above headings",
    sample: "PROGRAMS",
  },
  {
    name: "nav-link",
    desktopPx: 13,
    mobilePx: 13,
    weight: 600,
    lineHeight: 1,
    tracking: "0.08em",
    usage: "Uppercase nav link",
    sample: "STUDENTS",
  },
  {
    name: "note",
    desktopPx: 22,
    mobilePx: 20,
    weight: 500,
    lineHeight: 1.35,
    tracking: "0.005em",
    italic: true,
    usage: "Handwritten voice inflection",
    sample: "— starts any 1st of the month",
    note: "Used once per page as a handwritten voice inflection. Never for UI.",
  },
];

function TypeSample({ tier, size }: { tier: Tier; size: "desktop" | "mobile" }) {
  const px = size === "desktop" ? tier.desktopPx : tier.mobilePx;
  // Display tiers use clamp() — render via className so the sample reflects
  // the actual fluid behavior at the current viewport, not a forced pixel size
  // that overflows the demo container at 390px (audit fix).
  const isClamped = tier.name === "display-1" || tier.name === "display-2";
  return (
    <div>
      <p className="mb-3 font-mono text-meta uppercase text-ink-2">
        {size} · {isClamped ? `${tier.mobilePx}–${tier.desktopPx}px` : `${px}px`}
      </p>
      {isClamped ? (
        <p
          className={
            tier.name === "display-1"
              ? "text-display-1 text-balance"
              : "text-display-2 text-balance"
          }
        >
          {tier.sample}
        </p>
      ) : (
        <p
          style={{
            fontSize: `${px}px`,
            lineHeight: tier.lineHeight,
            letterSpacing: tier.tracking === "normal" ? undefined : tier.tracking,
            fontWeight: tier.weight,
            fontStyle: tier.italic ? "italic" : undefined,
            textWrap: "balance",
          }}
        >
          {tier.sample}
        </p>
      )}
    </div>
  );
}

function TypographyRow({ tier }: { tier: Tier }) {
  return (
    <div className="border-t border-hairline py-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="font-mono text-meta uppercase text-ink">text-{tier.name}</span>
        <span aria-hidden="true" className="text-hairline">
          /
        </span>
        <span className="font-mono text-meta uppercase text-ink-2">
          {tier.desktopPx}/{tier.mobilePx}px · w{tier.weight} · lh {tier.lineHeight} · tracking{" "}
          {tier.tracking}
          {tier.italic ? " · italic" : ""}
        </span>
        <span aria-hidden="true" className="text-hairline">
          /
        </span>
        <span className="font-mono text-meta uppercase text-ink-2">{tier.usage}</span>
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <TypeSample tier={tier} size="desktop" />
        <TypeSample tier={tier} size="mobile" />
      </div>
      {tier.note ? <p className="mt-6 max-w-2xl text-body-sm text-ink-2">{tier.note}</p> : null}
    </div>
  );
}

export function TypographySection() {
  return (
    <SectionShell
      id="typography"
      number="§2"
      label="Typography"
      meta={[
        { key: "tiers", value: "15" },
        { key: "family", value: "jakarta sans" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        One family, four weights, fifteen tiers — fourteen roman plus a single italic voice reserved
        for one handwritten inflection per page. Display tiers (display-1, display-2) clamp fluidly
        between the listed endpoints; resize the viewport to see the scale. Heading and body tiers
        force inline px so both desktop and mobile render regardless of viewport.
      </p>
      <div className="mt-10">
        {tiers.map((tier) => (
          <TypographyRow key={tier.name} tier={tier} />
        ))}
      </div>
    </SectionShell>
  );
}
