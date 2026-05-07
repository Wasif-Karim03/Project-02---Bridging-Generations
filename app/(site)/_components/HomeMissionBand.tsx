import { HorizonLine } from "@/components/motif/HorizonLine";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

type HomeMissionBandProps = {
  missionFull: string;
};

export function HomeMissionBand({ missionFull }: HomeMissionBandProps) {
  return (
    <section
      id="mission"
      aria-labelledby="home-mission-title"
      className="relative scroll-mt-20 overflow-hidden bg-ground-3 py-20 lg:py-32"
    >
      <HorizonLine
        tone="on-cream"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 block h-24 w-full -scale-y-100"
      />
      <div className="relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <Reveal stagger="up">
          <div className="flex max-w-[55ch] flex-col gap-5">
            <Eyebrow>Our mission</Eyebrow>
            <h2 id="home-mission-title" className="text-balance text-heading-2 text-ink">
              [CONFIRM: short mission headline]
            </h2>
            <p className="text-body-lg text-ink-2">{missionFull}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
