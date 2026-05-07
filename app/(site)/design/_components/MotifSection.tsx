import type { ReactNode } from "react";
import { AmberMark } from "@/components/motif/AmberMark";
import { CoralArc } from "@/components/motif/CoralArc";
import { CornerBracket } from "@/components/motif/CornerBracket";
import { HandDrawnUnderline } from "@/components/motif/HandDrawnUnderline";
import { HorizonLine } from "@/components/motif/HorizonLine";
import { TealPaperclip } from "@/components/motif/TealPaperclip";
import { SectionShell } from "./SectionShell";

export function MotifSection() {
  return (
    <SectionShell
      id="motif"
      number="§14"
      label="Motif bank"
      meta={[
        { key: "motifs", value: "6" },
        { key: "semantics", value: "decorative · aria-hidden" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Six recurring marks tie the Field Notes aesthetic together. Each has exactly one job; at
        most one per section, at most one repeated across a route. All marks carry{" "}
        <code className="font-mono text-meta text-ink">aria-hidden="true"</code> and no semantic
        weight.
      </p>
      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <MotifCell
          name="CoralArc"
          caption="Signature emphasis stroke under display-1 headlines and CTA titles."
        >
          <CoralArc className="w-[280px] max-w-full" />
        </MotifCell>

        <MotifCell name="AmberMark" caption="Soft-edged highlighter behind numbers and keywords.">
          <span className="relative inline-block px-3 py-1">
            <AmberMark className="absolute inset-0 h-full w-full" />
            <span className="relative text-heading-4 text-ink">156 students</span>
          </span>
        </MotifCell>

        <MotifCell
          name="TealPaperclip"
          caption="Top-left of pinned cards — trust signals, featured testimonials."
        >
          <TealPaperclip className="h-10 w-auto" />
        </MotifCell>

        <MotifCell
          name="HandDrawnUnderline"
          caption="Inline link hover state and full-width chapter breaks."
        >
          <span className="inline-flex flex-col items-start text-ink">
            <span className="text-body">Read more</span>
            <HandDrawnUnderline className="mt-0.5 w-full" />
          </span>
        </MotifCell>

        <MotifCell
          name="HorizonLine"
          caption="Full-width silhouette above CTA footers on trust pages."
        >
          <HorizonLine className="block h-20 w-full" />
        </MotifCell>

        <MotifCell
          name="CornerBracket"
          caption="Four-corner framing for trust-signal sidebars and pull-quote frames."
        >
          <CornerBracket className="bg-ground-2 p-6">
            <p className="text-body-sm text-ink-2">
              Framed content — notice the four hairline L-shapes tucked at each corner.
            </p>
          </CornerBracket>
        </MotifCell>
      </div>
    </SectionShell>
  );
}

type MotifCellProps = {
  name: string;
  caption: string;
  children: ReactNode;
};

function MotifCell({ name, caption, children }: MotifCellProps) {
  return (
    <div className="border-t border-hairline pt-6">
      <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">{name}</p>
      <div className="mt-4 flex min-h-24 items-center justify-center rounded bg-ground-3/60 p-6">
        {children}
      </div>
      <p className="mt-3 text-body-sm text-ink-2">{caption}</p>
    </div>
  );
}
