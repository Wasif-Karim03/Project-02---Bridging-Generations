import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { donationJourneySingleton } from "@/keystatic/singletons/donationJourney";
import { reader } from "./reader";

export type DonationJourney = Entry<typeof donationJourneySingleton>;
export type YearlyEntry = DonationJourney["yearlyEntries"][number];

export async function getDonationJourney(): Promise<DonationJourney> {
  const data = await reader.singletons.donationJourney.read();
  if (!data) {
    throw new Error(
      "donationJourney is missing — expected content/donation-journey/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}

export function getSortedYearlyEntries(entries: readonly YearlyEntry[]): YearlyEntry[] {
  return [...entries].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
}

export function getMaxYearRaised(entries: readonly YearlyEntry[]): number {
  return Math.max(...entries.map((e) => e.totalRaised ?? 0), 1);
}
