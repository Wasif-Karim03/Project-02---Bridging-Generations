import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import { weeklyReports } from "@/db/schema";

export type MonthlyGrowthPoint = {
  year: number;
  month: number; // 1–12
  attendanceRate: number; // 0–100, average of scored weeks
  reportCount: number;
};

/**
 * Aggregate a student's weekly reports into monthly attendance scores.
 * attendance scoring: full=100, partial=50, absent=0, unknown=excluded.
 * Returns an empty array in preview mode (no DB configured).
 */
export async function getStudentGrowthData(studentSlug: string): Promise<MonthlyGrowthPoint[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();

  const rows = await db
    .select({ weekOf: weeklyReports.weekOf, attendance: weeklyReports.attendance })
    .from(weeklyReports)
    .where(eq(weeklyReports.studentSlug, studentSlug));

  if (rows.length === 0) return [];

  const buckets = new Map<string, number[]>();
  for (const r of rows) {
    const score =
      r.attendance === "full"
        ? 100
        : r.attendance === "partial"
          ? 50
          : r.attendance === "absent"
            ? 0
            : null;
    if (score === null) continue;
    const d = new Date(r.weekOf);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(score);
    buckets.set(key, bucket);
  }

  const result: MonthlyGrowthPoint[] = [];
  for (const [key, scores] of buckets) {
    const [year, month] = key.split("-").map(Number) as [number, number];
    result.push({
      year,
      month,
      attendanceRate: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      reportCount: scores.length,
    });
  }

  return result.sort((a, b) => a.year - b.year || a.month - b.month);
}
