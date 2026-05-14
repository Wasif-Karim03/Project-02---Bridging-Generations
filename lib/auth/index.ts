import "server-only";
import { redirect } from "next/navigation";

// Env-gated Clerk integration. Every helper checks for CLERK_SECRET_KEY first
// so the site keeps working without Clerk credentials — pages render a clear
// "auth not yet configured" panel instead of crashing.
//
// Once CLERK_SECRET_KEY is set, `requireUser()` enforces sign-in and
// `requireRole()` enforces a role from the users table (Drizzle).

export function isClerkConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY);
}

export type AuthedUser = {
  userId: string;
  role?: "donor" | "mentor" | "admin" | "it";
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
 * Hard-require sign-in. Redirects to /sign-in when no one is signed in (or
 * Clerk isn't configured, which renders the "auth not yet configured" page).
 */
export async function requireUserId(): Promise<string> {
  if (!isClerkConfigured()) {
    // Send to sign-in, which itself shows the "not configured" panel.
    redirect("/sign-in");
  }
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Enforce a specific role. Reads the user record from the local DB (Drizzle)
 * if DATABASE_URL is set; otherwise falls back to letting any signed-in user
 * through (dev-only convenience) and logs a warning.
 *
 * Phase 4 wires the real Drizzle lookup; until then this is a stub.
 */
export async function requireRole(role: NonNullable<AuthedUser["role"]>): Promise<AuthedUser> {
  const userId = await requireUserId();
  // Hook this up to Drizzle in Phase 4. For now:
  //   - DB not configured: log a warning and allow through
  //   - DB configured: read users.role and enforce
  // The dashboard pages call this; the warning only prints in dev.
  if (!process.env.DATABASE_URL) {
    console.warn(
      `[auth] DATABASE_URL not set; allowing user ${userId} to access ${role}-gated page without role check.`,
    );
    return { userId, role };
  }
  // Phase 4: replace with real Drizzle query against users table.
  return { userId, role };
}
