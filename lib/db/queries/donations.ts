import "server-only";
import { and, desc, eq, gte, isNotNull, lt, max, sql, sum } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { Donation, NewDonation } from "@/db/schema";
import { donations, donorProfiles, users } from "@/db/schema";
import type { DonationRow } from "@/lib/content/donationsMock";

export type SponsoredStudentSummary = {
  studentSlug: string;
  totalCents: number;
  giftCount: number;
  lastGiftAt: Date;
};

export type DonorForStudentSummary = {
  // What to display on the student-facing dashboard. "Anonymous donor" if
  // the donor opted into anonymity on their profile; otherwise full name.
  display: string;
  totalCents: number;
  giftCount: number;
  lastGiftAt: Date;
  anonymous: boolean;
};

/**
 * Per-user donation history, newest first. In preview mode (no DB) returns
 * an empty list so a freshly-simulated donor signup looks like a real fresh
 * account — no synthetic "you've already given before" history. The mock
 * dataset is still exported (MOCK_DONATIONS) for design-system demos.
 */
export async function getDonationsForUser(userId: string): Promise<DonationRow[]> {
  if (!isDbConfigured()) {
    return [];
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
  if (!isDbConfigured()) return null;
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
  if (!isDbConfigured()) return 0;
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
  if (!isDbConfigured()) return 0;
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

/**
 * Roll up the unique students this donor has sponsored, with totals. Drives the
 * "Students you support" section on the donor dashboard. Donations to general
 * fund / project-only (no studentSlug) are excluded.
 */
export async function getStudentsSponsoredByUser(
  userId: string,
): Promise<SponsoredStudentSummary[]> {
  if (!isDbConfigured()) {
    // Preview mode: fresh accounts don't have sponsored students. Returning
    // [] makes the dashboard show its empty "Browse students" prompt instead
    // of demo data that looks like the user already gave to someone.
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      studentSlug: donations.studentSlug,
      totalCents: sum(donations.amountCents),
      giftCount: sql<number>`count(*)::int`,
      lastGiftAt: max(donations.occurredAt),
    })
    .from(donations)
    .where(
      and(
        eq(donations.donorUserId, userId),
        eq(donations.status, "succeeded"),
        isNotNull(donations.studentSlug),
      ),
    )
    .groupBy(donations.studentSlug)
    .orderBy(desc(sum(donations.amountCents)));

  return rows
    .filter((r): r is typeof r & { studentSlug: string; lastGiftAt: Date } =>
      Boolean(r.studentSlug && r.lastGiftAt),
    )
    .map((r) => ({
      studentSlug: r.studentSlug,
      totalCents: Number(r.totalCents ?? 0),
      giftCount: Number(r.giftCount ?? 0),
      lastGiftAt: r.lastGiftAt,
    }));
}

/**
 * Donors who have given to a specific student, grouped + summed by donor.
 * Drives the "Your sponsors" section on the student dashboard. Donor names
 * are masked when the donor's profile has anonymous=true (matches the
 * privacy rule on the public /donors page).
 */
export async function getDonorsForStudent(studentSlug: string): Promise<DonorForStudentSummary[]> {
  if (!isDbConfigured() || !studentSlug) return [];
  const db = getDb();
  const rows = await db
    .select({
      donorUserId: donations.donorUserId,
      donorEmail: donations.donorEmail,
      legalName: donorProfiles.legalName,
      displayName: users.displayName,
      publicInitials: donorProfiles.publicInitials,
      anonymous: donorProfiles.anonymous,
      totalCents: sum(donations.amountCents),
      giftCount: sql<number>`count(${donations.id})::int`,
      lastGiftAt: max(donations.occurredAt),
    })
    .from(donations)
    .leftJoin(users, eq(users.id, donations.donorUserId))
    .leftJoin(donorProfiles, eq(donorProfiles.userId, donations.donorUserId))
    .where(and(eq(donations.studentSlug, studentSlug), eq(donations.status, "succeeded")))
    .groupBy(
      donations.donorUserId,
      donations.donorEmail,
      donorProfiles.legalName,
      users.displayName,
      donorProfiles.publicInitials,
      donorProfiles.anonymous,
    )
    .orderBy(desc(sum(donations.amountCents)));

  return rows
    .filter((r): r is typeof r & { lastGiftAt: Date } => Boolean(r.lastGiftAt))
    .map((r) => {
      // If we have a real users row + profile, honor anonymity. If the
      // donation came from a guest (no donorUserId), it's anonymous by default.
      const isAnon = r.anonymous ?? !r.donorUserId;
      let display: string;
      if (isAnon) {
        display = r.publicInitials ? `Anonymous · ${r.publicInitials}` : "Anonymous donor";
      } else {
        display = r.legalName ?? r.displayName ?? r.donorEmail ?? "Donor";
      }
      return {
        display,
        totalCents: Number(r.totalCents ?? 0),
        giftCount: Number(r.giftCount ?? 0),
        lastGiftAt: r.lastGiftAt,
        anonymous: isAnon,
      };
    });
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
    donorUserId: row.donorUserId,
  };
}
