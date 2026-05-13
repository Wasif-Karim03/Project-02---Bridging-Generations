import { Dropcap } from "@/components/content/Dropcap";
import { SceneBreak } from "@/components/content/SceneBreak";

type AboutMissionVisionProps = {
  missionFull: string;
  visionFull: string;
};

// Mission/Vision content renders unconditionally — it was previously
// wrapped in <Reveal>, but the section sits below the fold on /about and
// the IntersectionObserver doesn't fire reliably during full-page
// screenshot capture or pre-hydration paint, leaving ~250px of empty
// cream where the trust content should be. R4.1 removes the gate so
// load-bearing copy can never be invisible.
export function AboutMissionVision({ missionFull, visionFull }: AboutMissionVisionProps) {
  return (
    <section
      id="mission"
      aria-labelledby="about-mission-title"
      className="scroll-mt-20 bg-ground px-4 py-20 sm:px-6 lg:px-[6%] lg:py-28"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-5">
          <SceneBreak />
          <h2 id="about-mission-title" className="text-balance text-heading-1 text-ink">
            Our Mission
          </h2>
          <Dropcap>
            <p className="text-body-lg text-ink-2">{missionFull}</p>
          </Dropcap>
        </div>
        <div className="flex flex-col gap-5">
          <SceneBreak />
          <h2 id="about-vision-title" className="text-balance text-heading-1 text-ink">
            Our Vision
          </h2>
          <Dropcap>
            <p className="text-body-lg text-ink-2">{visionFull}</p>
          </Dropcap>
        </div>
      </div>
    </section>
  );
}
