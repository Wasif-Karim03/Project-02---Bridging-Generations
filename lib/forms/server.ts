import "server-only";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { getDb, isDbConfigured } from "@/db/client";
import { rateLimits } from "@/db/schema";

// Cross-instance rate limit shared by every public form. Backed by Postgres
// when DATABASE_URL is set so multiple Netlify function instances see the
// same counters; falls back to per-process in-memory buckets in preview mode
// or when the DB write fails (degraded protection rather than no protection).
//
// Algorithm: one row per (key, ip) bucket. Each call upserts and increments
// the counter atomically. If the previous expires_at has passed we reset
// count to 1 and push expires_at forward. We return false (deny) when the
// new count exceeds the per-bucket max.
//
// Side effect: old expired rows accumulate. For a low-volume nonprofit site
// this is harmless; we can add a periodic DELETE if needed.

type Bucket = { count: number; resetAt: number };
const inMemoryBuckets = new Map<string, Bucket>();

type RateLimitOptions = {
  /** Logical bucket key — e.g. "scholarshipApplication". */
  key: string;
  /** Max submissions per window. Default 5. */
  max?: number;
  /** Window length in ms. Default 10 minutes. */
  windowMs?: number;
};

export async function takeRateSlot(
  ip: string,
  { key, max = 5, windowMs = 10 * 60 * 1000 }: RateLimitOptions,
): Promise<boolean> {
  if (isDbConfigured()) {
    const ok = await takeRateSlotPostgres(ip, { key, max, windowMs });
    if (ok !== null) return ok;
    // Fall through to in-memory if the DB call fails — degraded but safer
    // than letting every form through.
  }
  return takeRateSlotInMemory(ip, { key, max, windowMs });
}

async function takeRateSlotPostgres(
  ip: string,
  opts: Required<RateLimitOptions>,
): Promise<boolean | null> {
  const bucketKey = `${opts.key}:${ip}`;
  const now = new Date();
  const newExpires = new Date(now.getTime() + opts.windowMs);
  try {
    const db = getDb();
    // Upsert + atomic CASE: if the existing bucket has expired, reset to 1
    // with a fresh expires_at; otherwise increment count and keep expires_at.
    const result = await db
      .insert(rateLimits)
      .values({ bucketKey, count: 1, expiresAt: newExpires, updatedAt: now })
      .onConflictDoUpdate({
        target: rateLimits.bucketKey,
        set: {
          count: sql`CASE WHEN ${rateLimits.expiresAt} < NOW() THEN 1 ELSE ${rateLimits.count} + 1 END`,
          expiresAt: sql`CASE WHEN ${rateLimits.expiresAt} < NOW() THEN ${newExpires} ELSE ${rateLimits.expiresAt} END`,
          updatedAt: now,
        },
      })
      .returning({ count: rateLimits.count });
    const count = result[0]?.count ?? 1;
    return count <= opts.max;
  } catch (err) {
    console.error("[forms/rate-limit] postgres failed, falling back to memory", err);
    return null;
  }
}

function takeRateSlotInMemory(ip: string, opts: Required<RateLimitOptions>): boolean {
  const bucketKey = `${opts.key}:${ip}`;
  const now = Date.now();
  const existing = inMemoryBuckets.get(bucketKey);
  if (!existing || existing.resetAt <= now) {
    inMemoryBuckets.set(bucketKey, { count: 1, resetAt: now + opts.windowMs });
    return true;
  }
  if (existing.count >= opts.max) return false;
  existing.count += 1;
  return true;
}

/** Resolve the client IP from forwarding headers, with an "unknown" fallback. */
export async function clientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
};

/**
 * Send a transactional email via Resend, or log to stderr when no API key is
 * configured. The dev/preview UX stays smooth even before Resend is wired up.
 * Returns `true` on success, `false` on send failure.
 */
export async function sendEmail({ to, subject, text, replyTo }: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";

  if (!apiKey) {
    console.warn("[forms] RESEND_API_KEY is not set; submission logged but not sent.");
    console.info("[forms] %s → %s\n%s", subject, to, text);
    return true;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromAddress,
      to,
      replyTo,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.error("[forms] resend failed", err);
    return false;
  }
}
