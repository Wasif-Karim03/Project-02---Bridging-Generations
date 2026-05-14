import "server-only";
import { headers } from "next/headers";

// Per-IP rate limiter shared by every application form.
// In-memory only — fine for v1 (a single server instance). Phase 4 moves to
// the DB so multiple Vercel regions stay in sync.
type Bucket = { count: number; resetAt: number };
const bucketsByKey = new Map<string, Map<string, Bucket>>();

function getKeyBucket(key: string): Map<string, Bucket> {
  let bucket = bucketsByKey.get(key);
  if (!bucket) {
    bucket = new Map();
    bucketsByKey.set(key, bucket);
  }
  return bucket;
}

type RateLimitOptions = {
  /** Logical bucket key — e.g. "scholarshipApplication". */
  key: string;
  /** Max submissions per window. */
  max?: number;
  /** Window length in ms. */
  windowMs?: number;
};

export function takeRateSlot(
  ip: string,
  { key, max = 5, windowMs = 10 * 60 * 1000 }: RateLimitOptions,
): boolean {
  const now = Date.now();
  const bucket = getKeyBucket(key);
  const existing = bucket.get(ip);
  if (!existing || existing.resetAt <= now) {
    bucket.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= max) return false;
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
