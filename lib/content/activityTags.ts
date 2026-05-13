export const ACTIVITY_TAGS = [
  "distribution",
  "milestone",
  "visit",
  "announcement",
  "event",
  "fundraiser",
] as const;

export type ActivityTag = (typeof ACTIVITY_TAGS)[number];

export const ACTIVITY_TAG_LABELS: Record<ActivityTag, string> = {
  distribution: "Distribution",
  milestone: "Milestone",
  visit: "Visit",
  announcement: "Announcement",
  event: "Event",
  fundraiser: "Fundraiser",
};
