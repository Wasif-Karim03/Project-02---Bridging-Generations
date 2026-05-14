import { Fragment } from "react";
import { TimelineRail } from "@/components/ui/editorial/TimelineRail";
import { TagPill } from "@/components/ui/TagPill";
import type { YearlyEntry } from "@/lib/content/donationJourney";
import { getMaxYearRaised, getSortedYearlyEntries } from "@/lib/content/donationJourney";

type YearTimelineProps = {
  entries: readonly YearlyEntry[];
};

const TAG_LABELS: Record<string, string> = {
  milestone: "Milestone",
  fundraiser: "Fundraiser",
  scholarship: "Scholarship",
  distribution: "Distribution",
  visit: "Visit",
  announcement: "Announcement",
};

export function YearTimeline({ entries }: YearTimelineProps) {
  const sorted = getSortedYearlyEntries(entries);
  const maxRaised = getMaxYearRaised(sorted);

  return (
    <section
      aria-labelledby="journey-timeline-title"
      className="bg-ground px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 id="journey-timeline-title" className="sr-only">
          Year by year
        </h2>
        <TimelineRail ariaLabel="Donation journey year by year">
          {sorted.map((entry, i) => {
            const raised = entry.totalRaised ?? 0;
            const barPct = Math.round((raised / maxRaised) * 100);
            const isLast = i === sorted.length - 1;

            return (
              <Fragment key={entry.year}>
                <TimelineRail.MonthDivider label={String(entry.year ?? "")} />
                <TimelineRail.Entry className="mb-0">
                  <div className="pb-12 pl-6 lg:pl-10">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
                      {/* Left: amounts + bar */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <p className="text-display-2 font-bold text-ink">
                            ${raised.toLocaleString("en-US")}
                          </p>
                          <p className="text-meta uppercase tracking-[0.1em] text-ink-2">
                            raised this year
                          </p>
                        </div>
                        {/* Year-over-year bar */}
                        <div aria-hidden="true" className="flex flex-col gap-1.5">
                          <div className="relative h-2 w-full bg-hairline">
                            <div
                              className="absolute top-0 left-0 h-full bg-accent transition-[width] duration-700"
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                          <p className="text-meta text-ink-2">{barPct}% of peak year</p>
                        </div>
                        <dl className="flex flex-col gap-1 border-t border-hairline pt-4 text-body-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-meta uppercase tracking-[0.08em] text-ink-2">
                              Students
                            </dt>
                            <dd className="tabular-nums text-ink">{entry.studentCount ?? 0}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-meta uppercase tracking-[0.08em] text-ink-2">
                              Donors
                            </dt>
                            <dd className="tabular-nums text-ink">{entry.donorCount ?? 0}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Right: milestone + optional quote */}
                      <div className="flex flex-col gap-5">
                        {entry.milestoneTag ? (
                          <TagPill variant="stamp">
                            {TAG_LABELS[entry.milestoneTag] ?? entry.milestoneTag}
                          </TagPill>
                        ) : null}
                        <p className="text-body-lg text-ink">{entry.milestone}</p>
                        {entry.highlightQuote?.trim() ? (
                          <blockquote className="border-l-2 border-accent pl-4">
                            <p className="text-note text-ink-2">
                              &ldquo;{entry.highlightQuote}&rdquo;
                            </p>
                            {entry.quoteAttribution?.trim() ? (
                              <footer className="mt-2 text-meta uppercase tracking-[0.08em] text-ink-2">
                                — {entry.quoteAttribution}
                              </footer>
                            ) : null}
                          </blockquote>
                        ) : null}
                      </div>
                    </div>
                    {!isLast && (
                      <div className="mt-12 h-px w-full bg-hairline" aria-hidden="true" />
                    )}
                  </div>
                </TimelineRail.Entry>
              </Fragment>
            );
          })}
        </TimelineRail>
      </div>
    </section>
  );
}
