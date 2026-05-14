import "server-only";
import { and, desc, eq, gte, lt, sum } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { Donation, NewDonation } from "@/db/schema";
import { donations } from "@/db/schema";
import {
  type DonationRow,
  donationsForCurrentMonth,
  donationsForPreviousMonth,
  MOCK_DONATIONS,
  totalCents,
} from "@/lib/content/donationsMock";

/**
 * Per-user donation history, newest first. In preview mode (no DB) returns
 * the mock dataset so the donor dashboard is fully usable; with DB returns
 * the real rows scoped to this user.
 */
export async function getDonationsForUser(userId: string): Promise<DonationRow[]> {
  if (!isDbConfigured()) {
    // The mock data isn't user-scoped — show it to every preview user as a
    // demo; donors only ever see this when the org hasn't provisioned the DB.
    return MOCK_DONATIONS;
  }
  const db = getDb();
  const rows = await db
    .select()
    .from(donations)
    .where(eq(donations.donorUserId, userId))
    .orderBy(desc(donations.occurredAt));
  return rows.map(rowToDonationRow);
}

export async function getDonationById(id: string): Promise<DonationRow | null> {
  if (!isDbConfigured()) {
    return MOCK_DONATIONS.find((d) => d.id === id) ?? null;
  }
  const db = getDb();
  const rows = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
  const row = rows[0];
  return row ? rowToDonationRow(row) : null;
}

/**
 * Insert a donation row. Called by the Stripe webhook on
 * checkout.session.completed and invoice.paid events. Returns the inserted row,
 * or null when the DB isn't configured (the webhook still logs in that case).
 */
export async function insertDonation(payload: NewDonation): Promise<Donation | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(donations).values(payload).returning();
  return inserted[0] ?? null;
}

/**
 * Sum of cents donated in the current calendar month (UTC). Drives the
 * "this month" stat on the donor dashboard + admin dashboard.
 */
export async function thisMonthTotalCents(userId?: string): Promise<number> {
  if (!isDbConfigured()) {
    const list = userId
      ? MOCK_DONATIONS // mock doesn't filter by user; preview demo
      : MOCK_DONATIONS;
    return totalCents(donationsForCurrentMonth(list));
  }
  const db = getDb();
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const result = await db
    .select({ total: sum(donations.amountCents) })
    .from(donations)
    .where(
      userId
        ? and(
            eq(donations.donorUserId, userId),
            gte(donations.occurredAt, start),
            lt(donations.occurredAt, end),
          )
        : and(gte(donations.occurredAt, start), lt(donations.occurredAt, end)),
    );
  return Number(result[0]?.total ?? 0);
}

export async function lastMonthTotalCents(userId?: string): Promise<number> {
  if (!isDbConfigured()) {
    return totalCents(donationsForPreviousMonth(MOCK_DONATIONS));
  }
  const db = getDb();
  const now = new Date();
  const prevMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const prevMonthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const result = await db
    .select({ total: sum(donations.amountCents) })
    .from(donations)
    .where(
      userId
        ? and(
            eq(donations.donorUserId, userId),
            gte(donations.occurredAt, prevMonthStart),
            lt(donations.occurredAt, prevMonthEnd),
          )
        : and(gte(donations.occurredAt, prevMonthStart), lt(donations.occurredAt, prevMonthEnd)),
    );
  return Number(result[0]?.total ?? 0);
}

// Map a DB row into the shape the donor dashboard / mock already consume.
function rowToDonationRow(row: Donation): DonationRow {
  return {
    id: row.id,
    occurredAt: row.occurredAt,
    amountCents: row.amountCents,
    currency: row.currency,
    recurring: row.recurring,
    source: row.source,
    externalReference: row.externalReference,
    status: row.status,
    studentSlug: row.studentSlug,
    projectSlug: row.projectSlug,
    dedicationText: row.dedicationText,
  };
}
