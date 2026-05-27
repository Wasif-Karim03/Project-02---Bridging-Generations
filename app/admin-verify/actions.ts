"use server";

import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { generateOtp, recordOtp, verifyOtp } from "@/lib/db/queries/adminOtp";
import { sendAdminVerifyCodeEmail } from "@/lib/notifications/adminVerifyCode";

export type SendCodeState = { ok: true; sent: true } | { ok: false; error: string } | null;

// Server action — generate a 6-digit code, hash + persist it tied to this
// (user, sessionId), and email the plaintext to the admin.
export async function sendAdminVerifyCodeAction(
  _prev: SendCodeState,
  _formData: FormData,
): Promise<SendCodeState> {
  await requireUserId();
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };
  const me = await getCurrentDbUser();
  if (!me) return { ok: false, error: "Account lookup failed." };
  if (me.role !== "admin" && me.role !== "it") {
    return { ok: false, error: "This step is only for admin accounts." };
  }
  const sessionId = await currentSessionId();
  if (!sessionId) return { ok: false, error: "No active Clerk session." };

  const code = generateOtp();
  await recordOtp({ userId: me.id, sessionId, code });
  await sendAdminVerifyCodeEmail({
    email: me.email,
    displayName: me.displayName,
    code,
  });
  return { ok: true, sent: true };
}

export type VerifyCodeState = { ok: true } | { ok: false; error: string } | null;

export async function submitAdminVerifyCodeAction(
  _prev: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  await requireUserId();
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };
  const me = await getCurrentDbUser();
  if (!me) return { ok: false, error: "Account lookup failed." };
  const sessionId = await currentSessionId();
  if (!sessionId) return { ok: false, error: "No active Clerk session." };

  const code = String(formData.get("code") ?? "")
    .trim()
    .replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Code must be 6 digits." };
  }

  const result = await verifyOtp({ userId: me.id, sessionId, code });
  if (!result.ok) {
    switch (result.reason) {
      case "no_code":
        return { ok: false, error: "No code on file — send one first." };
      case "expired":
        return { ok: false, error: "Code expired. Send a fresh one." };
      case "exhausted":
        return {
          ok: false,
          error: "Too many wrong attempts. Send a new code.",
        };
      case "mismatch":
        return { ok: false, error: "Code didn't match. Try again." };
    }
  }
  redirect("/dashboard/admin");
}

async function currentSessionId(): Promise<string | null> {
  const { auth } = await import("@clerk/nextjs/server");
  const { sessionId } = await auth();
  return sessionId ?? null;
}
