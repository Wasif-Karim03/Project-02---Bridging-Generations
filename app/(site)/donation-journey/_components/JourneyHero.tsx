import Image from "next/image";
import { AmberMark } from "@/components/motif/AmberMark";
import { HorizonLine } from "@/components/motif/HorizonLine";
import { Eyebrow } from "@/components/ui/Eyebrow";

type JourneyHeroProps = {
  headline: string;
  intro: string;
  totalRaisedAllTime: number;
};

export function JourneyHero({ headline, intro, totalRaisedAllTime }: JourneyHeroProps) {
  const formatted = `$${totalRaisedAllTime.toLocaleString("en-US")}`;

  return (
    <section
      aria-labelledby="journey-hero-title"
      className="teal-panel relative overflow-hidden px-4 pt-24 pb-20 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-28"
    >
      {/* Background photo */}
      <Image
        src="/donors-hero.jpg"
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />
      {/* Dark teal overlay to keep text readable */}
      <span aria-hidden="true" className="absolute inset-0 z-[1] bg-[#0f4c5c]/50" />
      <span aria-hidden="true" className="teal-panel-glyph z-[2]" />
      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-8">
        <Eyebrow className="text-white/75">Impact</Eyebrow>
        <div className="flex flex-col gap-3">
          <h1
            id="journey-hero-title"
            className="max-w-[22ch] text-balance text-display-2 text-white"
          >
            {headline}
          </h1>
          <p className="max-w-[44ch] text-body-lg text-white/80">{intro}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-meta uppercase tracking-[0.1em] text-white/60">Raised to date</p>
          <div className="relative inline-block">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-[0.08em] z-0 block"
            >
              <AmberMark className="block h-[0.28em] w-full opacity-70" />
            </span>
            <p className="relative z-10 text-display-1 font-bold text-white">{formatted}</p>
          </div>
        </div>
      </div>
      <HorizonLine
        tone="on-teal"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 block h-24 w-full"
      />
    </section>
  );
}
