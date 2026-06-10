import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import type { DonorSummary } from "@/lib/db/queries/featuredDonors";
import { formatUsd, initialsFromName } from "@/lib/donor/featured";

// Public "Our Donors" grid shown on /donors. Admin-curated featured donors,
// each linking to their breakdown page at /donors/featured/<slug>.
export function DonorWall({ donors }: { donors: DonorSummary[] }) {
  if (donors.length === 0) return null;

  return (
    <section className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24" aria-labelledby="donor-wall-title">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-10">
        <header className="flex flex-col gap-3">
          <Eyebrow>Our Donors</Eyebrow>
          <h2 id="donor-wall-title" className="max-w-[20ch] text-balance text-display-3 text-ink">
            The people behind the impact
          </h2>
          <p className="max-w-[52ch] text-body-lg text-ink-2">
            Generous supporters whose gifts keep students in the classroom. Tap a donor to see every
            student they've supported.
          </p>
        </header>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {donors.map((d) => (
            <li key={d.id}>
              <Link
                href={`/donors/featured/${d.slug}`}
                className="group flex h-full flex-col items-center gap-4 rounded-2xl border border-hairline bg-ground-2 p-7 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <DonorAvatar name={d.name} photoUrl={d.photoUrl} />
                <div className="flex flex-col gap-1">
                  <p className="text-heading-5 text-ink group-hover:text-accent-2-text">{d.name}</p>
                  {d.blurb ? <p className="text-body-sm text-ink-2">{d.blurb}</p> : null}
                </div>
                <dl className="mt-auto flex w-full items-stretch justify-center divide-x divide-hairline pt-2">
                  <div className="flex flex-1 flex-col gap-0.5 px-3">
                    <dt className="text-meta uppercase tracking-[0.06em] text-ink-2">Donated</dt>
                    <dd className="text-body font-semibold tabular-nums text-ink">
                      {formatUsd(d.totalCents)}
                    </dd>
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5 px-3">
                    <dt className="text-meta uppercase tracking-[0.06em] text-ink-2">Students</dt>
                    <dd className="text-body font-semibold tabular-nums text-ink">
                      {d.studentCount}
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DonorAvatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return (
      // biome-ignore lint/performance/noImgElement: arbitrary external donor photo URL
      <img
        src={photoUrl}
        alt={name}
        className="size-24 rounded-full object-cover shadow-[var(--shadow-card)]"
      />
    );
  }
  return (
    <span className="grid size-24 place-items-center rounded-full bg-accent/15 text-heading-3 font-semibold text-accent">
      {initialsFromName(name)}
    </span>
  );
}
