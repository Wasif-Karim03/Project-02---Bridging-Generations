import { AmberMark } from "@/components/motif/AmberMark";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";

type DonorsHeroProps = {
  donorCount: number;
  subhead: string;
};

export function DonorsHero({ donorCount, subhead }: DonorsHeroProps) {
  return (
    <section
      aria-labelledby="donors-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <Reveal>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
          <Eyebrow>Gratitude</Eyebrow>
          <h1 id="donors-hero-title" className="max-w-[22ch] text-balance text-display-2 text-ink">
            <span className="relative inline-block">
              <span className="relative z-10">{donorCount}</span>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-[0.12em] z-0">
                <AmberMark className="block h-[0.35em] w-full" />
              </span>
            </span>{" "}
            anonymous donors so far.
          </h1>
          <p className="max-w-[44ch] text-body-lg text-ink-2">{subhead}</p>
        </div>
      </Reveal>
    </section>
  );
}
