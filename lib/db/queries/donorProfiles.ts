import "server-only";
import { desc, eq, sql, sum } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { DonorProfile } from "@/db/schema";
import { donations, donorProfiles, users } from "@/db/schema";
import { type DonorListRow, MOCK_DONOR_LIST } from "@/lib/content/applicationsMock";

export type DonorProfileShape = {
  legalName: string;
  publicInitials: string;
  anonymous: boolean;
  dedicationText: string;
  photoUrl: string;
};

const EMPTY_PROFILE: DonorProfileShape = {
  legalName: "",
  publicInitials: "",
  anonymous: true,
  dedicationText: "",
  photoUrl: "",
};

export async function getDonorProfile(userId: string): Promise<DonorProfileShape> {
  if (!isDbConfigured()) return EMPTY_PROFILE;
  const db = getDb();
  const rows = await db
    .select()
    .from(donorProfiles)
    .where(eq(donorProfiles.userId, userId))
    .limit(1);
  return rows[0] ? rowToShape(rows[0]) : EMPTY_PROFILE;
}

export async function upsertDonorProfile(
  userId: string,
  patch: Partial<DonorProfileShape>,
): Promise<DonorProfileShape> {
  if (!isDbConfigured()) {
    // In preview mode the editor pretends to save; mirror that here so
    // callers get a consistent return shape.
    return { ...EMPTY_PROFILE, ...patch };
  }
  const db = getDb();
  const existing = await db
    .select()
    .from(donorProfiles)
    .where(eq(donorProfiles.userId, userId))
    .limit(1);
  const now = new Date();
  if (existing[0]) {
    const updated = await db
      .update(donorProfiles)
      .set({
        legalName: patch.legalName ?? existing[0].legalName,
        publicInitials: patch.publicInitials ?? existing[0].publicInitials,
        anonymous: patch.anonymous ?? existing[0].anonymous,
        dedicationText: patch.dedicationText ?? existing[0].dedicationText,
        photoUrl: patch.photoUrl ?? existing[0].photoUrl,
        updatedAt: now,
      })
      .where(eq(donorProfiles.id, existing[0].id))
      .returning();
    return rowToShape(updated[0] ?? existing[0]);
  }
  const inserted = await db
    .insert(donorProfiles)
    .values({
      userId,
      legalName: patch.legalName ?? null,
      publicInitials: patch.publicInitials ?? null,
      anonymous: patch.anonymous ?? true,
      dedicationText: patch.dedicationText ?? null,
      photoUrl: patch.photoUrl ?? null,
    })
    .returning();
  return rowToShape(inserted[0]);
}

function rowToShape(row: DonorProfile): DonorProfileShape {
  return {
    legalName: row.legalName ?? "",
    publicInitials: row.publicInitials ?? "",
    anonymous: row.anonymous,
    dedicationText: row.dedicationText ?? "",
    photoUrl: row.photoUrl ?? "",
  };
}

/**
 * Real donor list for the admin dashboard — joins users with their
 * donor_profiles and sums up succeeded donations. Anyone with role=donor
 * appears, even with zero gifts (so the admin can see who's signed up but
 * not yet given). Falls back to MOCK_DONOR_LIST in preview mode.
 */
export async function listAllDonors(limit = 200): Promise<DonorListRow[]> {
  if (!isDbConfigured()) return MOCK_DONOR_LIST;
  const db = getDb();
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
      legalName: donorProfiles.legalName,
      publicInitials: donorProfiles.publicInitials,
      anonymous: donorProfiles.anonymous,
      lifetimeCents: sum(donations.amountCents),
      donationCount: sql<number>`count(${donations.id})::int`,
    })
    .from(users)
    .leftJoin(donorProfiles, eq(donorProfiles.userId, users.id))
    .leftJoin(
      donations,
      sql`${donations.donorUserId} = ${users.id} AND ${donations.status} = 'succeeded'`,
    )
    .where(eq(users.role, "donor"))
    .groupBy(
      users.id,
      users.email,
      users.displayName,
      donorProfiles.legalName,
      donorProfiles.publicInitials,
      donorProfiles.anonymous,
    )
    .orderBy(desc(sum(donations.amountCents)))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    legalName: r.legalName ?? r.displayName ?? r.email,
    publicInitials: r.publicInitials ?? "",
    email: r.email,
    lifetimeCents: Number(r.lifetimeCents ?? 0),
    donationCount: Number(r.donationCount ?? 0),
    anonymous: r.anonymous ?? true,
  }));
}
