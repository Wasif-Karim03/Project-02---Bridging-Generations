import "server-only";
import { desc, sql } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { ManualDonationEntry, NewManualDonationEntry } from "@/db/schema";
import { manualDonationEntries } from "@/db/schema";

// List of manual donation entries for the accountant dashboard. Sorted by
// occurredAt desc — accountants think in chronological "when did this gift
// come in", not recordedAt.
export async function listManualDonations(limit = 500): Promise<ManualDonationEntry[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(manualDonationEntries)
    .orderBy(desc(manualDonationEntries.occurredAt))
    .limit(limit);
}

export async function insertManualDonation(
  args: Omit<NewManualDonationEntry, "id" | "recordedAt">,
): Promise<ManualDonationEntry | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(manualDonationEntries).values(args).returning();
  return inserted[0] ?? null;
}

export type FinancialSummary = {
  totalCents: number;
  count: number;
  perMonth: Array<{ ym: string; totalCents: number; count: number }>;
  perDonor: Array<{ donorKey: string; donorLabel: string; totalCents: number; count: number }>;
  perStudent: Array<{ studentSlug: string; totalCents: number; count: number }>;
};

// Build a financial summary from the manual ledger. Aggregates done in SQL
// where they're easy (sum + count + group by month, donor, student); the
// per-donor/per-student secondary labels come from the same select.
export async function buildFinancialSummary(args?: {
  fromIso?: string;
  toIso?: string;
}): Promise<FinancialSummary> {
  if (!isDbConfigured()) {
    return { totalCents: 0, count: 0, perMonth: [], perDonor: [], perStudent: [] };
  }
  const db = getDb();
  const from = args?.fromIso ? new Date(args.fromIso) : null;
  const to = args?.toIso ? new Date(args.toIso) : null;

  // Date filter clause shared by every aggregate.
  const where = sql`(${from ? sql`occurred_at >= ${from.toISOString()}` : sql`TRUE`}) AND (${
    to ? sql`occurred_at <= ${to.toISOString()}` : sql`TRUE`
  })`;

  const totalRow = await db.execute<{ total_cents: number; cnt: number }>(sql`
    SELECT COALESCE(SUM(amount_cents), 0)::int AS total_cents, COUNT(*)::int AS cnt
    FROM manual_donation_entries WHERE ${where}
  `);
  const perMonthRows = await db.execute<{
    ym: string;
    total_cents: number;
    cnt: number;
  }>(sql`
    SELECT TO_CHAR(occurred_at, 'YYYY-MM') AS ym,
           COALESCE(SUM(amount_cents), 0)::int AS total_cents,
           COUNT(*)::int AS cnt
    FROM manual_donation_entries
    WHERE ${where}
    GROUP BY ym ORDER BY ym DESC
  `);
  const perDonorRows = await db.execute<{
    donor_key: string;
    donor_label: string;
    total_cents: number;
    cnt: number;
  }>(sql`
    SELECT COALESCE(donor_user_id::text, donor_email, '(unknown)') AS donor_key,
           COALESCE(donor_name, donor_email, '(unknown)') AS donor_label,
           COALESCE(SUM(amount_cents), 0)::int AS total_cents,
           COUNT(*)::int AS cnt
    FROM manual_donation_entries
    WHERE ${where}
    GROUP BY donor_key, donor_label ORDER BY total_cents DESC
  `);
  const perStudentRows = await db.execute<{
    student_slug: string;
    total_cents: number;
    cnt: number;
  }>(sql`
    SELECT COALESCE(student_slug, '(unassigned)') AS student_slug,
           COALESCE(SUM(amount_cents), 0)::int AS total_cents,
           COUNT(*)::int AS cnt
    FROM manual_donation_entries
    WHERE ${where}
    GROUP BY student_slug ORDER BY total_cents DESC
  `);

  return {
    totalCents: totalRow[0]?.total_cents ?? 0,
    count: totalRow[0]?.cnt ?? 0,
    perMonth: perMonthRows.map((r) => ({
      ym: r.ym,
      totalCents: r.total_cents,
      count: r.cnt,
    })),
    perDonor: perDonorRows.map((r) => ({
      donorKey: r.donor_key,
      donorLabel: r.donor_label,
      totalCents: r.total_cents,
      count: r.cnt,
    })),
    perStudent: perStudentRows.map((r) => ({
      studentSlug: r.student_slug,
      totalCents: r.total_cents,
      count: r.cnt,
    })),
  };
}
