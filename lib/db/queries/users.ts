import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { NewUser, User } from "@/db/schema";
import { users } from "@/db/schema";

// Email of the one account that's allowed to skip the approval queue.
// Read at call time (not module load) so changing the env var doesn't
// require a redeploy of code that already imported this module.
function bootstrapAdminEmail(): string | null {
  const v = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  return v && v.length > 0 ? v : null;
}

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
//
// New-user policy: every signup lands as status=pending so an admin has to
// approve. The one exception is BOOTSTRAP_ADMIN_EMAIL — that email gets
// role=admin + status=active on its first signup. Subsequent admins are
// promoted by existing admins via /dashboard/admin/users.
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
  const isBootstrap =
    bootstrapAdminEmail() !== null && args.email.trim().toLowerCase() === bootstrapAdminEmail();
  const row: NewUser = {
    clerkUserId: args.clerkUserId,
    email: args.email,
    displayName: args.displayName ?? null,
    role: isBootstrap ? "admin" : "donor",
    status: isBootstrap ? "active" : "pending",
  };
  const inserted = await db.insert(users).values(row).returning();
  return inserted[0] ?? null;
}

// Admin-only utility — flip a user's approval status. Used by the new
// pending-signups queue (approve / reject / suspend / reinstate).
export async function setUserStatus(
  userId: string,
  status: "pending" | "active" | "rejected" | "suspended",
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
}

// Admin-only — list every signup awaiting review. Driven by the new
// /dashboard/admin/pending queue.
export async function listPendingUsers(limit = 200): Promise<User[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(users)
    .where(eq(users.status, "pending"))
    .orderBy(desc(users.createdAt))
    .limit(limit);
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
  role:
    | "donor"
    | "mentor"
    | "admin"
    | "it"
    | "student"
    | "accountant"
    | "media"
    | "lead"
    | "pm"
    | "comm",
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

// List all users currently holding the mentor role. Empty list in preview
// mode (no DB).
export async function listAllMentors(limit = 200): Promise<User[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(users)
    .where(eq(users.role, "mentor"))
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

// List every student-role user. Drives /dashboard/admin/students — the
// admin's surface for reviewing pending student applications and linking
// approved accounts to Keystatic student slugs.
export async function listAllStudentUsers(limit = 500): Promise<User[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  return db
    .select()
    .from(users)
    .where(eq(users.role, "student"))
    .orderBy(desc(users.createdAt))
    .limit(limit);
}

// Admin-only: set a student account's Keystatic slug link. Setting it to
// null effectively un-links the account (puts them back into the pending
// state on /dashboard/student).
export async function setUserStudentSlug(
  userId: string,
  studentSlug: string | null,
): Promise<void> {
  if (!isDbConfigured()) return;
  const db = getDb();
  await db.update(users).set({ studentSlug, updatedAt: new Date() }).where(eq(users.id, userId));
}
