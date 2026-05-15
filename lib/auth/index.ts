import "server-only";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db/client";
import type { User } from "@/db/schema";
import { getUserByClerkId, upsertUserFromClerk } from "@/lib/db/queries/users";

// Env-gated Clerk integration. Every helper checks for CLERK_SECRET_KEY first
// so the site keeps working without Clerk credentials — pages render a clear
// "auth not yet configured" panel instead of crashing.
//
// Once CLERK_SECRET_KEY is set, `requireUser()` enforces sign-in and
// `requireRole()` enforces a role from the users table (Drizzle).

export function isClerkConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY);
}

export type Role = "donor" | "mentor" | "admin" | "it" | "student";

export type AuthedUser = {
  userId: string;
  role?: Role;
};

/**
 * Returns the current Clerk userId, or null if no one is signed in / Clerk
 * isn't configured. Use this in pages that want soft auth (show different
 * content for signed-in vs signed-out without forcing sign-in).
 */
export async function getUserIdOptional(): Promise<string | null> {
  if (!isClerkConfigured()) return null;
  try {
    // Dynamic import so the bundle doesn't pull Clerk for routes that never
    // invoke auth(). Each call is cheap once cached by the module loader.
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

/**
 * Hard-require sign-in. Redirects to /sign-in when no one is signed in.
 *
 * In local dev (NODE_ENV=development) with Clerk NOT configured, returns a
 * synthetic user id so dashboard routes are demoable without auth. This is
 * the same "preview mode" requireRole() falls back to. Production deploys
 * always have Clerk configured (per LAUNCH-CHECKLIST.md Phase C), so this
 * branch never fires in production.
 */
export async function requireUserId(): Promise<string> {
  if (!isClerkConfigured()) {
    if (process.env.NODE_ENV === "development") {
      return "preview-dev-user";
    }
    redirect("/sign-in");
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Resolve the local users row for the currently signed-in Clerk user. If the
 * Clerk webhook hasn't yet seeded the row (race on first sign-in), do a
 * just-in-time upsert so dashboard requests never 500 on a brand-new account.
 * Returns null when the DB isn't configured (preview mode) or Clerk metadata
 * is missing.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  if (!isClerkConfigured() || !isDbConfigured()) return null;
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) return null;
  const existing = await getUserByClerkId(userId);
  if (existing) return existing;
  // Webhook hasn't fired yet (or was misconfigured) — backfill from the live
  // Clerk session so the donor's first dashboard hit still works.
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;
  const displayName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;
  return upsertUserFromClerk({ clerkUserId: userId, email, displayName });
}

/**
 * Hard-require sign-in and a specific role. Reads the user record from the
 * local DB (Drizzle) and enforces `users.role`. When DATABASE_URL is unset
 * (preview mode), allows any signed-in user through with a warning so the
 * dashboard remains demoable.
 */
export async function requireRole(role: Role): Promise<AuthedUser> {
  const userId = await requireUserId();
  if (!isDbConfigured()) {
    console.warn(
      `[auth] DATABASE_URL not set; allowing user ${userId} to access ${role}-gated page without role check.`,
    );
    return { userId, role };
  }
  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    // Signed in to Clerk but missing from the local mirror and we couldn't
    // backfill (e.g. no email). Treat as unauthorized.
    redirect("/sign-in");
  }
  const allowed = roleSatisfies(dbUser.role, role);
  if (!allowed) {
    // The user is signed in but lacks the required role — send them home
    // rather than 403 to keep the experience friendly.
    redirect("/dashboard/donor");
  }
  return { userId, role: dbUser.role as Role };
}

// Role hierarchy: admin/it ≥ mentor ≥ donor. Anything beneath the required
// role is rejected; anything at or above is allowed through.
// Students sit in their own track outside the donor → mentor → admin ladder.
// They never need elevated access; they only ever see their own dashboard.
const ROLE_RANK: Record<string, number> = {
  student: 1,
  donor: 1,
  mentor: 2,
  admin: 3,
  it: 3,
};

function roleSatisfies(actual: string, required: Role): boolean {
  return (ROLE_RANK[actual] ?? 0) >= (ROLE_RANK[required] ?? 0);
}
