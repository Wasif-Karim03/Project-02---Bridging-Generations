import { Reveal } from "@/components/ui/Reveal";

type GalleryHeroProps = {
  count: number;
};

export function GalleryHero({ count }: GalleryHeroProps) {
  return (
    <section
      aria-labelledby="gallery-hero-title"
      className="bg-ground px-4 pt-24 pb-12 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-16"
    >
      <Reveal>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
          <h1 id="gallery-hero-title" className="max-w-[18ch] text-balance text-display-2 text-ink">
            Gallery.
          </h1>
          <p className="max-w-[44ch] text-body-lg text-ink-2">
            Photographs from partner schools, program visits, and the students we sponsor.
          </p>
          <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
            <li>{count} photographs</li>
            <li>partner schools</li>
            <li>field reports</li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
