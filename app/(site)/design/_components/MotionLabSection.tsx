import { Reveal } from "@/components/ui/Reveal";
import { SectionAct } from "@/components/ui/SectionAct";
import { MotionDemo } from "./MotionDemo";
import { SectionShell } from "./SectionShell";

const easeSmooth = [0.16, 1, 0.3, 1] as const;
const easeInOut = [0.4, 0, 0.2, 1] as const;

export function MotionLabSection() {
  return (
    <SectionShell
      id="motion"
      number="§12"
      label="Motion"
      meta={[
        { key: "named", value: "6" },
        { key: "reduced-motion", value: "safe" },
      ]}
    >
      <p className="max-w-2xl text-body text-ink-2">
        Six named motions in the R4.9 vocabulary, each demonstrated below with a Replay button,
        motion / reduced side-by-side, duration label, and an easing-curve sketch. Every motion has
        a <code className="font-mono">prefers-reduced-motion: reduce</code> contract — the
        &ldquo;Reduced&rdquo; pane mirrors what the reader sees with that preference set.
      </p>

      <div className="mt-10 flex flex-col gap-2">
        <MotionDemo
          name="develop"
          source="components/ui/Reveal.tsx · kind=develop"
          durationMs={900}
          easing={easeSmooth}
          easingToken="--ease-smooth"
          reducedMotion="Opacity-only fallback. Filter, sepia, and brightness are removed; the image renders at its final tone immediately."
          reducedPreview={
            <div
              aria-hidden="true"
              className="h-32 w-full bg-accent-2"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-accent-2) 0%, var(--color-accent) 100%)",
              }}
            />
          }
        >
          <Reveal kind="develop">
            <div
              aria-hidden="true"
              className="h-32 w-full bg-accent-2"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--color-accent-2) 0%, var(--color-accent) 100%)",
              }}
            />
          </Reveal>
        </MotionDemo>

        <MotionDemo
          name="kenburns"
          source="app/globals.css · .kenburns"
          durationMs={20000}
          easing={easeInOut}
          easingToken="ease-in-out (infinite alternate)"
          reducedMotion="Static frame. The animation is canceled; transform resets to scale(1)."
          autoCycle={false}
          reducedPreview={
            <div className="h-32 w-full overflow-hidden bg-accent">
              <div
                aria-hidden="true"
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 32% 38%, var(--color-accent-3) 0%, var(--color-accent-2-text) 35%, var(--color-accent) 100%)",
                }}
              />
            </div>
          }
        >
          <div className="h-32 w-full overflow-hidden bg-accent">
            <div
              aria-hidden="true"
              className="kenburns h-full w-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 32% 38%, var(--color-accent-3) 0%, var(--color-accent-2-text) 35%, var(--color-accent) 100%)",
              }}
            />
          </div>
        </MotionDemo>

        <MotionDemo
          name="horizon"
          source="components/ui/SectionAct.tsx"
          durationMs={400}
          easing={easeSmooth}
          easingToken="--ease-smooth"
          reducedMotion="Line static at full opacity. No Y-translate, no transition."
          reducedPreview={
            <div className="relative pt-6">
              <span
                aria-hidden="true"
                className="absolute top-0 left-0 block h-px w-16 bg-hairline"
              />
              <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink">
                Act break headline
              </p>
              <p className="mt-2 max-w-prose text-body-sm text-ink-2">
                Body copy continues below the headline.
              </p>
            </div>
          }
        >
          <SectionAct>
            <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink">
              Act break headline
            </p>
            <p className="mt-2 max-w-prose text-body-sm text-ink-2">
              Body copy continues below the headline.
            </p>
          </SectionAct>
        </MotionDemo>

        <MotionDemo
          name="settle"
          source="components/layout/Nav.tsx · ActiveMotif"
          durationMs={220}
          easing={easeSmooth}
          easingToken="--ease-smooth"
          reducedMotion="Instant. Motif renders at full opacity with no Y-translate or transition."
          reducedPreview={
            <div className="flex h-32 items-center justify-center bg-accent">
              <span className="relative text-nav-link font-bold uppercase text-white">
                Active page
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-8 -translate-x-1/2 bg-accent-2-text"
                />
              </span>
            </div>
          }
        >
          <div className="flex h-32 items-center justify-center bg-accent">
            <span className="relative text-nav-link font-bold uppercase text-white">
              Active page
              <span
                aria-hidden="true"
                className="nav-active-motif pointer-events-none absolute -bottom-1.5 left-1/2 h-[2px] w-8 -translate-x-1/2 bg-accent-2-text"
              />
            </span>
          </div>
        </MotionDemo>

        <MotionDemo
          name="page-fade"
          source="components/layout/ViewTransitionRoot.tsx · ::view-transition-old/new(root)"
          durationMs={220}
          easing={easeSmooth}
          easingToken="--ease-smooth"
          reducedMotion="No transition. The new page renders instantly; the old page is removed without animation."
          reducedPreview={
            <div className="relative h-32 overflow-hidden border border-hairline bg-ground-2">
              <div className="absolute inset-0 flex items-center justify-center font-mono text-meta uppercase tracking-[0.1em] text-ink">
                Route B
              </div>
            </div>
          }
        >
          <div className="relative h-32 overflow-hidden border border-hairline bg-ground-2">
            <div
              className="absolute inset-0 flex items-center justify-center font-mono text-meta uppercase tracking-[0.1em] text-ink-2"
              style={{ animation: "vt-fade-out var(--motion-xs) var(--ease-in-out) both" }}
            >
              Route A
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center font-mono text-meta uppercase tracking-[0.1em] text-ink"
              style={{ animation: "vt-fade-in var(--motion-sm) var(--ease-smooth) both" }}
            >
              Route B
            </div>
          </div>
        </MotionDemo>

        <MotionDemo
          name="drawer-sheet"
          source="components/layout/Nav.tsx · mobile menu panel"
          durationMs={400}
          easing={easeSmooth}
          easingToken="--ease-smooth"
          reducedMotion="Instant. Panel renders at final position with no Y-translate or fade."
          reducedPreview={
            <div className="h-32 border border-hairline bg-ground-2 p-4 shadow-[var(--shadow-card-hover)]">
              <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink">Mobile menu</p>
              <ul className="mt-3 flex flex-col gap-1 text-body-sm text-ink-2">
                <li>Home</li>
                <li>About</li>
                <li>Donate</li>
              </ul>
            </div>
          }
        >
          <div className="drawer-sheet h-32 border border-hairline bg-ground-2 p-4 shadow-[var(--shadow-card-hover)]">
            <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink">Mobile menu</p>
            <ul className="mt-3 flex flex-col gap-1 text-body-sm text-ink-2">
              <li>Home</li>
              <li>About</li>
              <li>Donate</li>
            </ul>
          </div>
        </MotionDemo>
      </div>

      <div className="mt-12 border-t border-hairline pt-8">
        <p className="font-mono text-meta uppercase tracking-[0.1em] text-ink-2">
          Reduced-motion contract
        </p>
        <p className="mt-3 text-body-sm text-ink-2">
          When <code className="font-mono">prefers-reduced-motion: reduce</code> matches:
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-body-sm text-ink-2 sm:grid-cols-2">
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">develop</span> — opacity-only fallback.
          </li>
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">kenburns</span> — static frame.
          </li>
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">horizon</span> — line static, no settle.
          </li>
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">settle</span> — instant.
          </li>
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">page-fade</span> — no transition.
          </li>
          <li>
            <span aria-hidden="true" className="text-accent-2-text">
              ✓
            </span>{" "}
            <span className="font-mono text-ink">drawer-sheet</span> — instant.
          </li>
        </ul>
      </div>
    </SectionShell>
  );
}
