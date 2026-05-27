import "server-only";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { AccountantProfile, NewAccountantProfile } from "@/db/schema";
import { accountantProfiles } from "@/db/schema";

// Look up an accountant profile by the canonical users.id. Returns null in
// preview mode (no DB) or when the profile doesn't exist (user hasn't
// completed step 2 of signup).
export async function getAccountantProfile(userId: string): Promise<AccountantProfile | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(accountantProfiles)
    .where(eq(accountantProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

// Insert the row. Caller should have already checked that no row exists
// (the signup page does that check before rendering the form).
export async function insertAccountantProfile(
  args: Omit<NewAccountantProfile, "id" | "createdAt" | "updatedAt">,
): Promise<AccountantProfile | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const inserted = await db.insert(accountantProfiles).values(args).returning();
  return inserted[0] ?? null;
}
