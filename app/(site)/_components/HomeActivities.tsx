import { Link } from "next-view-transitions";
import { ActivityCard } from "@/components/domain/ActivityCard";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import type { Activity } from "@/lib/content/activities";

type HomeActivitiesProps = {
  activities: Activity[];
};

export function HomeActivities({ activities }: HomeActivitiesProps) {
  return (
    <section
      id="activities"
      aria-labelledby="home-activities-title"
      className="scroll-mt-20 bg-ground-2 py-20 lg:py-32"
    >
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-[6%]">
        <header className="mb-12 flex flex-col gap-4 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <Eyebrow>From the field</Eyebrow>
            <h2 id="home-activities-title" className="text-balance text-heading-2 text-ink">
              Recent activities
            </h2>
          </div>
          <Link
            href="/activities"
            className="group inline-flex min-h-[44px] items-center gap-1 py-2 text-nav-link uppercase text-accent transition hover:text-accent-2-text active:text-accent-2-text"
          >
            See all activities
            <span
              aria-hidden="true"
              className="transition-transform motion-safe:group-hover:translate-x-1 motion-safe:group-active:translate-x-1"
            >
              →
            </span>
          </Link>
        </header>
        <Reveal cascade cascadeDelay={120} className="flex flex-col">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Reveal>
      </div>
    </section>
  );
}
