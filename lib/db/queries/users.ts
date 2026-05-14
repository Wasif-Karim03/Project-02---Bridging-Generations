import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { NewUser, User } from "@/db/schema";
import { users } from "@/db/schema";

// Lookup the local mirror of a Clerk user. Returns null if no row exists
// (Clerk created the user but the webhook hasn't run yet) or if the DB
// isn't configured.
export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.clerkUserId, clerkUserId)).limit(1);
  return rows[0] ?? null;
}

// Lookup by email — used as the fallback attribution path in the Stripe
// webhook when a checkout event has a donor email but no clerkUserId
// (anonymous donor, or donation made before account creation).
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

// Lookup by primary key — used by the receipt route to resolve a donation's
// owner record for the receipt header.
export async function getUserById(id: string): Promise<User | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

// Idempotent upsert — called by the Clerk webhook + as a safety net at the
// start of dashboard requests when the local mirror is stale.
export async function upsertUserFromClerk(args: {
  clerkUserId: string;
  email: string;
  displayName?: string | null;
}): Promise<User | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const now = new Date();
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, args.clerkUserId))
    .limit(1);
  if (existing[0]) {
    const updated = await db
      .update(users)
      .set({
        email: args.email,
        displayName: args.displayName ?? existing[0].displayName,
        updatedAt: now,
      })
      .where(eq(users.id, existing[0].id))
      .returning();
    return updated[0] ?? existing[0];
  }
  const row: NewUser = {
    clerkUserId: args.clerkUserId,
    email: args.email,
    displayName: args.displayName ?? null,
    role: "donor", // sensible default — admin grants higher roles via the dashboard
  };
  const inserted = await db.insert(users).values(row).returning();
  return inserted[0] ?? null;
}

// Mark a local row deleted (or hard-delete) when Clerk fires user.deleted.
export async function deleteUserByClerkId(clerkUserId: string): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.delete(users).where(eq(users.clerkUserId, clerkUserId));
}

// Admin-only utility — promote a user to a new role.
export async function setUserRole(
  userId: string,
  role: "donor" | "mentor" | "admin" | "it",
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
}

// Admin user list — drives the /dashboard/admin/users role assignment screen.
// Returns the empty list when the DB isn't configured (preview mode).
export async function listAllUsers(limit = 200): Promise<User[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit);
}
