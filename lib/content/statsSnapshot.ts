import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { statsSnapshotSingleton } from "@/keystatic/singletons/statsSnapshot";
import { reader } from "./reader";

export type StatsSnapshot = Entry<typeof statsSnapshotSingleton>;

export async function getStatsSnapshot(): Promise<StatsSnapshot> {
  const data = await reader.singletons.statsSnapshot.read();
  if (!data) {
    throw new Error(
      "statsSnapshot is missing — expected content/stats-snapshot/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}
