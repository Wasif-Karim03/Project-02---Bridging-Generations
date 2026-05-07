"use client";

import { useMemo, useState } from "react";
import { ActivityCard } from "@/components/domain/ActivityCard";
import { TimelineRail } from "@/components/ui/editorial";
import { type FilterChipOption, FilterChips } from "@/components/ui/FilterChips";
import type { Activity } from "@/lib/content/activities";
import { ACTIVITY_TAG_LABELS, ACTIVITY_TAGS, type ActivityTag } from "@/lib/content/activityTags";

type ActivityFilterProps = {
  activities: Activity[];
};

const ALL = "all" as const;
type Selection = typeof ALL | ActivityTag;

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function monthKey(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return monthFormatter.format(d);
}

export function ActivityFilter({ activities }: ActivityFilterProps) {
  const [selection, setSelection] = useState<Selection>(ALL);

  const availableTags = useMemo(() => {
    const present = new Set<ActivityTag>();
    for (const a of activities) present.add(a.tag);
    return ACTIVITY_TAGS.filter((t) => present.has(t));
  }, [activities]);

  const filtered = useMemo(() => {
    if (selection === ALL) return activities;
    return activities.filter((a) => a.tag === selection);
  }, [activities, selection]);

  // R4.8: counts render on every chip, not just the leading "All". The
  // tag-specific counts reflect the unfiltered population so a user can see
  // how many entries each filter would return.
  const options: FilterChipOption<Selection>[] = useMemo(() => {
    const tagCounts = new Map<ActivityTag, number>();
    for (const a of activities) {
      tagCounts.set(a.tag, (tagCounts.get(a.tag) ?? 0) + 1);
    }
    return [
      { value: ALL, label: "All", count: activities.length },
      ...availableTags.map((tag) => ({
        value: tag,
        label: ACTIVITY_TAG_LABELS[tag],
        count: tagCounts.get(tag) ?? 0,
      })),
    ];
  }, [activities, availableTags]);

  return (
    <>
      <FilterChips
        options={options}
        value={selection}
        onChange={setSelection}
        ariaLabel="Filter activities by type"
      />
      {filtered.length === 0 ? (
        <p className="text-body text-ink-2">No activities match this filter yet.</p>
      ) : (
        <TimelineRail ariaLabel="Recent activities timeline" className="flex flex-col">
          {filtered.flatMap((activity, index) => {
            const currentMonth = monthKey(activity.publishedAt);
            const previousMonth = index === 0 ? null : monthKey(filtered[index - 1].publishedAt);
            const nodes = [];
            if (currentMonth && currentMonth !== previousMonth) {
              nodes.push(
                <TimelineRail.MonthDivider
                  key={`divider-${currentMonth}-${activity.id}`}
                  label={currentMonth}
                />,
              );
            }
            nodes.push(
              <TimelineRail.Entry key={activity.id}>
                <ActivityCard activity={activity} as="article" hideRule priority={index === 0} />
              </TimelineRail.Entry>,
            );
            return nodes;
          })}
        </TimelineRail>
      )}
    </>
  );
}
