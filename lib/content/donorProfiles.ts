import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { donorProfileCollection } from "@/keystatic/collections/donorProfile";
import { reader } from "./reader";

type RawDonorProfile = Entry<typeof donorProfileCollection>;
export type DonorProfile = RawDonorProfile & { id: string };
export type DonationEntry = DonorProfile["donationHistory"][number];

function normalize(slug: string, entry: RawDonorProfile): DonorProfile {
  return { ...entry, id: slug };
}

export async function getAllDonorProfiles(): Promise<DonorProfile[]> {
  const entries = await reader.collections.donorProfile.all();
  return entries.map(({ slug, entry }) => normalize(slug, entry));
}

export async function getDonorProfileBySlug(slug: string): Promise<DonorProfile | null> {
  const entry = await reader.collections.donorProfile.read(slug);
  return entry ? normalize(slug, entry) : null;
}

export async function getAllPublicDonorProfiles(): Promise<DonorProfile[]> {
  const all = await getAllDonorProfiles();
  return all.filter((p) => !p.isAnonymous);
}

export function getTotalDonated(history: readonly DonationEntry[]): number {
  return history.reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
}

export function getYearsActive(history: readonly DonationEntry[]): number {
  const years = new Set(
    history.map((e) => (e.date ? new Date(e.date).getFullYear() : null)).filter(Boolean),
  );
  return years.size;
}

export function getStudentsSupported(history: readonly DonationEntry[]): number {
  const ids = new Set(
    history.map((e) => e.linkedStudentId).filter((id): id is string => Boolean(id)),
  );
  return ids.size;
}

/** Group donation history by year → month (1-indexed) for the calendar heat map. */
export function groupHistoryByYearMonth(
  history: readonly DonationEntry[],
): Map<number, Map<number, number>> {
  const result = new Map<number, Map<number, number>>();
  for (const entry of history) {
    if (!entry.date) continue;
    const d = new Date(entry.date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    if (!result.has(year)) result.set(year, new Map());
    const yearMap = result.get(year) ?? new Map<number, number>();
    yearMap.set(month, (yearMap.get(month) ?? 0) + (entry.amount ?? 0));
    result.set(year, yearMap);
  }
  return result;
}
