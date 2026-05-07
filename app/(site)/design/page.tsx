import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { AvatarDividerSection } from "./_components/AvatarDividerSection";
import { BreakpointSection } from "./_components/BreakpointSection";
import { ButtonSection } from "./_components/ButtonSection";
import { ChapterDivider } from "./_components/ChapterDivider";
import { ColorSection } from "./_components/ColorSection";
import { EyebrowTagPillSection } from "./_components/EyebrowTagPillSection";
import { FormSection } from "./_components/FormSection";
import { IconGridSection } from "./_components/IconGridSection";
import { MobileSection } from "./_components/MobileSection";
import { MotifSection } from "./_components/MotifSection";
import { MotionLabSection } from "./_components/MotionLabSection";
import { ProgressBarSection } from "./_components/ProgressBarSection";
import { ShadowSection } from "./_components/ShadowSection";
import { ShapeSection } from "./_components/ShapeSection";
import { SpacingSection } from "./_components/SpacingSection";
import { TypographySection } from "./_components/TypographySection";

export const metadata: Metadata = {
  title: "Design System",
  description: "Internal design system reference. Not indexed.",
  robots: { index: false, follow: false, nocache: true },
};

export default function DesignPage() {
  return (
    <div>
      <header className="pb-16">
        <p className="flex flex-wrap items-baseline gap-2 font-mono text-meta uppercase tracking-[0.12em] text-ink-2">
          <span>Bridging Generations</span>
          <span aria-hidden="true" className="text-hairline">
            /
          </span>
          <span>Design System</span>
          <span aria-hidden="true" className="text-hairline">
            /
          </span>
          <span>v1.0 · April 2026</span>
        </p>
        <h1 className="mt-8 text-display-1 leading-[0.95] text-ink">Design System</h1>
        <p className="mt-8 max-w-2xl text-body-lg text-ink-2">
          Every token, primitive, and surface the site ships with. Internal reference, not indexed.
          Warm, editorial, confident. Sharp corners; warmth from color and type.
        </p>
        <ul className="mt-8 flex flex-wrap items-baseline gap-3 font-mono text-meta uppercase text-ink-2">
          <li>14 sections</li>
          <li aria-hidden="true" className="text-hairline">
            /
          </li>
          <li>
            <span>5 chapters</span>
          </li>
          <li aria-hidden="true" className="text-hairline">
            /
          </li>
          <li>wcag 2.2 aa</li>
          <li aria-hidden="true" className="text-hairline">
            /
          </li>
          <li>reduced-motion safe</li>
        </ul>
      </header>

      {/* Mobile TOC — desktop sidebar lives at lg:+ in design/layout.tsx, so
          phones and tablets currently scroll ~26K px with no in-page nav. */}
      <nav aria-label="Sections" className="mb-12 lg:hidden [&_summary]:min-h-[48px]">
        <Accordion summary="In this document" defaultOpen={false}>
          <ol className="space-y-4 pt-2 text-body-sm">
            <li>
              <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                I · Foundations
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#color">
                    Color
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#typography">
                    Typography
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#spacing">
                    Spacing
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#shape">
                    Shape
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#shadow">
                    Shadow
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                II · Primitives
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#buttons">
                    Buttons
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#eyebrow-tagpill">
                    Eyebrow & TagPill
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#progressbar">
                    Progress Bar
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#avatar-divider">
                    Avatar & Divider
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                III · Surfaces
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#forms">
                    Forms
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#icons">
                    Icons
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                IV · System
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#motion">
                    Motion
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#breakpoint">
                    Breakpoint
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                V · Motifs
              </p>
              <ul className="mt-1 space-y-1">
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#motif">
                    Motifs
                  </a>
                </li>
                <li>
                  <a className="text-ink-2 hover:text-accent" href="#mobile">
                    §15 Mobile rules
                  </a>
                </li>
              </ul>
            </li>
          </ol>
        </Accordion>
      </nav>

      <ChapterDivider index="I" label="Foundations" />
      <ColorSection />
      <TypographySection />
      <SpacingSection />
      <ShapeSection />
      <ShadowSection />

      <ChapterDivider index="II" label="Primitives" />
      <ButtonSection />
      <EyebrowTagPillSection />
      <ProgressBarSection />
      <AvatarDividerSection />

      <ChapterDivider index="III" label="Surfaces" />
      <FormSection />
      <IconGridSection />

      <ChapterDivider index="IV" label="System" />
      <MotionLabSection />
      <BreakpointSection />

      <ChapterDivider index="V" label="Motifs" />
      <MotifSection />

      <MobileSection />
    </div>
  );
}
