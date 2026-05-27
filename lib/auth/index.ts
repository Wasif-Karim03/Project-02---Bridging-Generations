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

export type Role =
  | "donor"
  | "mentor"
  | "admin"
  | "it"
  | "student"
  | "accountant"
  | "media"
  | "lead"
  | "pm"
  | "comm";

export type UserStatus = "pending" | "active" | "rejected" | "suspended";

export type AuthedUser = {
  userId: string;
  role?: Role;
  status?: UserStatus;
};

// Bootstrap admin — the single email allowed to skip the approval queue.
// Compared lowercase to avoid case-sensitivity bugs (Clerk normalizes some
// providers' emails but not all). Returns false if the env var is empty.
export function isBootstrapAdminEmail(email: string | null | undefined): boolean {
  const bootstrap = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  if (!bootstrap || !email) return false;
  return email.trim().toLowerCase() === bootstrap;
}

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
 *
 * When a signed-in user lacks the required role, they're redirected to
 * THEIR role's dashboard — so a student bouncing off /dashboard/admin
 * lands on /dashboard/student, a donor on /dashboard/donor, etc.
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
  // Status gate runs before the role check — a pending mentor shouldn't get
  // bounced to their mentor dashboard just to be rejected there; they go
  // straight to the waiting page.
  if (dbUser.status === "pending") {
    redirect("/pending-approval");
  }
  if (dbUser.status === "rejected" || dbUser.status === "suspended") {
    redirect(`/pending-approval?state=${dbUser.status}`);
  }
  const allowed = roleSatisfies(dbUser.role, role);
  if (!allowed) {
    redirect(dashboardForRole(dbUser.role));
  }
  return { userId, role: dbUser.role as Role, status: dbUser.status as UserStatus };
}

// Like requireRole but only checks status, not role rank. Used by dashboard
// layouts that already self-route on role — they still need to bounce
// pending/rejected/suspended users to /pending-approval before rendering.
export async function requireActiveUser(): Promise<AuthedUser> {
  const userId = await requireUserId();
  if (!isDbConfigured()) {
    return { userId };
  }
  const dbUser = await getCurrentDbUser();
  if (!dbUser) redirect("/sign-in");
  if (dbUser.status === "pending") redirect("/pending-approval");
  if (dbUser.status === "rejected" || dbUser.status === "suspended") {
    redirect(`/pending-approval?state=${dbUser.status}`);
  }
  return {
    userId,
    role: dbUser.role as Role,
    status: dbUser.status as UserStatus,
  };
}

// Map a role to its home dashboard. Used by requireRole's fallback redirect
// and by the role-mismatch guards on each dashboard's own page.
export function dashboardForRole(role: string): string {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "mentor":
      return "/dashboard/mentor";
    case "admin":
    case "it":
      return "/dashboard/admin";
    case "accountant":
      return "/dashboard/accountant";
    case "media":
      return "/dashboard/media";
    // Placeholder roles (lead, pm, comm) land on the generic dashboard
    // selector until their own workspaces ship.
    case "lead":
    case "pm":
    case "comm":
      return "/dashboard";
    default:
      return "/dashboard/donor";
  }
}

// Role hierarchy. Tracks split into ladders:
//   • donor → mentor → admin/it (the original civic ladder)
//   • student (own track, never needs elevation)
//   • accountant / media (workspace roles that report to admin)
//   • lead / pm / comm (placeholders; rank 1 so they don't accidentally
//     unlock anything until their feature work lands)
// Anything at or above the required rank is allowed; anything beneath is
// redirected to its own dashboard.
const ROLE_RANK: Record<string, number> = {
  student: 1,
  donor: 1,
  accountant: 1,
  media: 1,
  lead: 1,
  pm: 1,
  comm: 1,
  mentor: 2,
  admin: 3,
  it: 3,
};

function roleSatisfies(actual: string, required: Role): boolean {
  return (ROLE_RANK[actual] ?? 0) >= (ROLE_RANK[required] ?? 0);
}
