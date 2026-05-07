import { Accordion } from "@/components/ui/Accordion";
import { MobileImage } from "@/components/ui/MobileImage";
import { ChapterDivider } from "./ChapterDivider";
import { SectionShell } from "./SectionShell";

/**
 * /design §15 — Mobile rules. Live demonstrations of the R4.10 mobile-
 * first system. Same shape as Motion Lab: each rule is a working demo,
 * not a description.
 *
 * Eight sub-sections:
 *   §15.1 Display-tier clamps
 *   §15.2 Touch-hover gating
 *   §15.3 StickyCTA
 *   §15.4 SheetDrawer
 *   §15.5 Accordion
 *   §15.6 Image-aspect ladder
 *   §15.7 Form-input no-zoom rule
 *   §15.8 Go/no-go contract
 */
export function MobileSection() {
  return (
    <>
      <ChapterDivider index="VI" label="Mobile" />

      <SectionShell
        id="mobile"
        number="§15"
        label="Mobile rules"
        meta={[
          { key: "rules", value: "8" },
          { key: "ref-device", value: "402×874" },
        ]}
      >
        <p className="max-w-2xl text-body text-ink-2">
          R4.10's mobile-first system. Every rule is a working demo. The §15.8 contract is what
          every primary route is held to.
        </p>

        {/* §15.1 Display-tier clamps */}
        <article id="mobile-15-1" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.1 Display-tier clamps</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            display-1 / -2 / -3 fluid-scale via clamp(). Floors are tuned so an H1 of typical
            headline length never exceeds 3 lines at 402.
          </p>
          <div className="space-y-4">
            <div className="border-l-4 border-accent pl-4">
              <span className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                display-1
              </span>
              <p className="text-display-1">Bridging generations.</p>
            </div>
            <div className="border-l-4 border-accent pl-4">
              <span className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                display-2
              </span>
              <p className="text-display-2">Field updates from five partner schools.</p>
            </div>
            <div className="border-l-4 border-accent pl-4">
              <span className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">
                display-3
              </span>
              <p className="text-display-3">Notes from the field.</p>
            </div>
          </div>
        </article>

        {/* §15.2 Touch-hover gating */}
        <article id="mobile-15-2" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.2 Touch-hover gating</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Tailwind v4 gates <code className="font-mono">hover:</code> on{" "}
            <code className="font-mono">@media (hover: hover)</code>. Cards never receive their lift
            on touch. Demonstrated by the card below.
          </p>
          <div className="w-64 rounded-lg border border-hairline bg-ground-2 p-4 transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]">
            <p className="font-mono text-meta uppercase tracking-[0.16em] text-ink-2">Demo card</p>
            <p className="text-heading-5">Hover me on a desktop. Tap me on a phone.</p>
            <p className="mt-2 text-body text-ink-2">Lift only fires under (hover: hover).</p>
          </div>
        </article>

        {/* §15.3 StickyCTA */}
        <article id="mobile-15-3" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.3 StickyCTA</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Pinned to the viewport bottom on phones; hidden at sm:+. Honors{" "}
            <code className="font-mono">env(safe-area-inset-bottom)</code>. Auto-hides when an input
            has focus. Live consumer: /donate at &lt;sm.
          </p>
          <div className="rounded-lg border border-hairline bg-ground-2 p-4">
            <p className="text-meta text-ink-2">
              The page-level <code className="font-mono">StickyCTA</code> appears only at &lt;sm
              widths. Resize this window narrow to see the live demo on /donate.
            </p>
          </div>
        </article>

        {/* §15.4 SheetDrawer */}
        <article id="mobile-15-4" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.4 SheetDrawer</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Edge-anchored slide-in built on native &lt;dialog&gt;. Focus trap, ESC close, and inert
            background come for free; body scroll lock and backdrop-click-to-close added. Used by
            Nav at &lt;sm widths.
          </p>
          <p className="text-meta text-ink-2">
            Demo: open the Nav drawer (hamburger top-right) at &lt;sm.
          </p>
        </article>

        {/* §15.5 Accordion */}
        <article id="mobile-15-5" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.5 Accordion</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Native &lt;details&gt;/&lt;summary&gt; with editorial styling. Used by the Footer at
            &lt;sm to collapse link clusters.
          </p>
          <div className="max-w-md border-y border-hairline">
            <Accordion summary="Explore" defaultOpen>
              <ul className="space-y-2 text-body">
                <li>About</li>
                <li>Projects</li>
                <li>Activities</li>
              </ul>
            </Accordion>
            <Accordion summary="Recognize">
              <ul className="space-y-2 text-body">
                <li>Donors</li>
                <li>Testimonials</li>
              </ul>
            </Accordion>
            <Accordion summary="Trust">
              <ul className="space-y-2 text-body">
                <li>Form 990</li>
                <li>Privacy</li>
              </ul>
            </Accordion>
          </div>
        </article>

        {/* §15.6 Image-aspect ladder */}
        <article id="mobile-15-6" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.6 Image-aspect ladder</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            mobile-aspect-portrait (4:5 at &lt;sm, 16:9 at sm:+) and mobile-aspect-square (1:1 at
            &lt;sm, 16:9 at sm:+). Resize the window to see the same image swap aspect. Editorial
            focal point is a per-image override exposed via mobileFocalPoint.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <MobileImage
              src="/student-1.jpg"
              alt="Demo portrait — mobile-aspect-portrait, focal {50,25}"
              ladder="portrait"
              mobileFocalPoint={{ x: 50, y: 25 }}
            />
            <MobileImage
              src="/project-meal.jpg"
              alt="Demo cover — mobile-aspect-square, focal default"
              ladder="square"
            />
          </div>
        </article>

        {/* §15.7 Form-input no-zoom */}
        <article id="mobile-15-7" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.7 Form-input no-zoom rule</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Global rule: input/select/textarea computed font-size = max(16px, 1rem). Pins the iOS
            Safari zoom threshold so future per-form font tweaks can't regress.
          </p>
          <input
            type="text"
            placeholder="Tap me on iOS — no zoom"
            aria-label="Form-input no-zoom demo"
            className="w-full max-w-md rounded border border-hairline px-3 py-2"
          />
        </article>

        {/* §15.8 Go/no-go contract */}
        <article id="mobile-15-8" className="mt-12 border-t border-hairline pt-8">
          <h3 className="mb-2 text-heading-4">§15.8 Go/no-go contract</h3>
          <p className="mb-6 max-w-[60ch] text-body text-ink-2">
            Every primary route is held to this checklist at iPhone 17 Pro (402×874) before R4.10
            ships.
          </p>
          <ul className="space-y-2 text-body">
            <li>☐ H1 ≤ 3 lines on mobile.</li>
            <li>☐ Primary CTA visible inside the first 2 mobile viewport-heights of scroll.</li>
            <li>☐ Every interactive target ≥ 48px.</li>
            <li>☐ Zero hover-only state on touch.</li>
            <li>☐ Filter chips: horizontal-scroll-with-edge-fade OR compact-dropdown.</li>
            <li>☐ Mobile inputs at max(16px, 1rem).</li>
            <li>☐ 16:9 hero crops swap to 4:5 or 1:1 at &lt;sm via mobile-aspect-*.</li>
            <li>☐ Per-image mobileFocalPoint applied where set.</li>
            <li>☐ Nav drawer is a SheetDrawer (sliding sheet), not a centered modal.</li>
            <li>☐ Footer is collapsed via Accordion at &lt;sm.</li>
            <li>☐ Mobile LCP ≤ 2.5s on the route.</li>
          </ul>
        </article>
      </SectionShell>
    </>
  );
}
