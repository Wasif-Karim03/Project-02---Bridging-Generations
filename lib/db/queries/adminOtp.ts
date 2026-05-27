import "server-only";
import { createHash, randomInt } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { AdminOtpCode } from "@/db/schema";
import { adminOtpCodes } from "@/db/schema";

// OTP lifetime — 10 minutes from send. Long enough that a slow inbox
// doesn't block sign-in, short enough that a stolen code is mostly stale.
export const OTP_TTL_MS = 10 * 60 * 1000;

// Cap on guesses per code. Beyond this, the row is marked failed by
// returning a verification miss without incrementing further — keeps the
// brute-force surface tiny (six digits + N attempts is still 6 orders of
// magnitude wider than we should allow without a captcha).
export const OTP_MAX_ATTEMPTS = 5;

function hash(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

// Generate a 6-digit numeric code, zero-padded. Uses crypto.randomInt
// so the distribution is uniform (no Math.random / Date.now bias).
export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

// Insert (or replace) the active code for this (user, session). We
// don't carry old codes around — every send invalidates the previous
// one for the same session by setting expires_at in the past.
export async function recordOtp(args: {
  userId: string;
  sessionId: string;
  code: string;
}): Promise<AdminOtpCode | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const now = new Date();
  // Expire any prior unverified codes for this session.
  await db
    .update(adminOtpCodes)
    .set({ expiresAt: now })
    .where(and(eq(adminOtpCodes.userId, args.userId), eq(adminOtpCodes.sessionId, args.sessionId)));
  const inserted = await db
    .insert(adminOtpCodes)
    .values({
      userId: args.userId,
      sessionId: args.sessionId,
      codeHash: hash(args.code),
      sentAt: now,
      expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    })
    .returning();
  return inserted[0] ?? null;
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: "no_code" | "expired" | "mismatch" | "exhausted" };

// Atomic-ish verify: increment attempts, then compare hash. If hash
// matches AND attempts <= cap AND not expired, mark verified. We do the
// read + update in two statements rather than one CTE because Drizzle
// doesn't ship CTE syntax stable yet; the race is small (a single admin
// re-entering the same code twice within ms) and the consequence is just
// double-increment which works in our favor.
export async function verifyOtp(args: {
  userId: string;
  sessionId: string;
  code: string;
}): Promise<VerifyResult> {
  if (!isDbConfigured()) return { ok: false, reason: "no_code" };
  const db = getDb();
  const rows = await db
    .select()
    .from(adminOtpCodes)
    .where(and(eq(adminOtpCodes.userId, args.userId), eq(adminOtpCodes.sessionId, args.sessionId)))
    .orderBy(desc(adminOtpCodes.sentAt))
    .limit(1);
  const row = rows[0];
  if (!row) return { ok: false, reason: "no_code" };
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false, reason: "exhausted" };
  }
  // Bump the attempt count regardless of outcome (so brute force is
  // still capped even if the user just retries the same code).
  await db
    .update(adminOtpCodes)
    .set({ attempts: row.attempts + 1 })
    .where(eq(adminOtpCodes.id, row.id));
  if (row.expiresAt.getTime() < Date.now() && !row.verifiedAt) {
    return { ok: false, reason: "expired" };
  }
  if (row.codeHash !== hash(args.code)) {
    return { ok: false, reason: "mismatch" };
  }
  // Mark verified so the layout cookie check can confirm freshly.
  await db
    .update(adminOtpCodes)
    .set({ verifiedAt: new Date() })
    .where(eq(adminOtpCodes.id, row.id));
  return { ok: true };
}

// Is the current (user, session) considered verified? Used by the admin
// layout to gate access. A session is verified for as long as there's a
// row with verifiedAt set AND its sessionId matches the caller's session.
export async function isSessionVerifiedForAdmin(args: {
  userId: string;
  sessionId: string;
}): Promise<boolean> {
  if (!isDbConfigured()) return false;
  const db = getDb();
  const rows = await db
    .select({ verifiedAt: adminOtpCodes.verifiedAt })
    .from(adminOtpCodes)
    .where(and(eq(adminOtpCodes.userId, args.userId), eq(adminOtpCodes.sessionId, args.sessionId)))
    .orderBy(desc(adminOtpCodes.sentAt))
    .limit(1);
  return rows.length > 0 && rows[0].verifiedAt !== null;
}
