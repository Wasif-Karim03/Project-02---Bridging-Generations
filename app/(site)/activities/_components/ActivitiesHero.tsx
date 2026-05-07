import { Eyebrow } from "@/components/ui/Eyebrow";

type ActivitiesHeroProps = {
  count: number;
};

export function ActivitiesHero({ count }: ActivitiesHeroProps) {
  return (
    <section
      aria-labelledby="activities-hero-title"
      className="bg-ground px-4 pt-24 pb-16 sm:px-6 lg:px-[6%] lg:pt-36 lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6">
        <Eyebrow>Field updates</Eyebrow>
        <h1
          id="activities-hero-title"
          className="max-w-[22ch] text-balance text-display-2 text-ink"
        >
          Recent activities
        </h1>
        <p className="max-w-[44ch] text-body-lg text-ink-2">
          Short field updates across our partner schools — distribution days, milestones, board
          visits, and fundraiser news.
        </p>
        <ul className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-hairline pt-4 text-meta uppercase tracking-[0.1em] text-ink-2">
          <li>
            {count} {count === 1 ? "update" : "updates"}
          </li>
          <li>field reports</li>
          <li>partner schools</li>
        </ul>
      </div>
    </section>
  );
}
