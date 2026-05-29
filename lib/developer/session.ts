import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getDeveloperPassword, getSessionSecret } from "./config";

const COOKIE_NAME = "bg_dev_session";
// 7 days — long enough that the owner isn't re-typing the password constantly,
// short enough that an abandoned session lapses.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Compare against self to keep timing uniform, then fail.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** True when the supplied password matches the configured one. */
export function verifyPassword(input: string): boolean {
  const expected = getDeveloperPassword();
  if (!expected) return false;
  return constantTimeEqual(input, expected);
}

// The cookie value is `<issuedAt>.<hmac>`. The HMAC is keyed on the session
// secret, so it can't be forged without the secret and is invalidated if the
// secret (or password fallback) rotates.
function sign(issuedAt: string): string {
  return createHmac("sha256", getSessionSecret()).update(issuedAt).digest("hex");
}

function makeToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, mac] = token.split(".");
  if (!issuedAt || !mac) return false;
  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_SECONDS * 1000) return false;
  return constantTimeEqual(mac, sign(issuedAt));
}

export async function createSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, makeToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Read the request cookies and report whether the caller is signed in. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(COOKIE_NAME)?.value);
}
