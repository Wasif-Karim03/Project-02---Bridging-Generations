import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { activityCollection } from "@/keystatic/collections/activity";
import { reader } from "./reader";

export type { ActivityTag } from "./activityTags";
export { ACTIVITY_TAG_LABELS, ACTIVITY_TAGS } from "./activityTags";

export type Activity = Entry<typeof activityCollection> & { id: string };

export async function getAllActivities(): Promise<Activity[]> {
  const entries = await reader.collections.activity.all();
  return entries.map(({ slug, entry }) => ({ ...entry, id: slug }));
}

function isPublishedNow(activity: Activity, now = new Date()): boolean {
  if (!activity.published) return false;
  if (!activity.publishedAt) return false;
  return new Date(activity.publishedAt).getTime() <= now.getTime();
}

export function filterPublishedActivities(activities: Activity[], now = new Date()): Activity[] {
  return activities
    .filter((a) => isPublishedNow(a, now))
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
}

export async function getAllActivitiesPublished(): Promise<Activity[]> {
  return filterPublishedActivities(await getAllActivities());
}

export async function getRecentActivities(limit = 2): Promise<Activity[]> {
  const all = await getAllActivitiesPublished();
  return all.slice(0, limit);
}
