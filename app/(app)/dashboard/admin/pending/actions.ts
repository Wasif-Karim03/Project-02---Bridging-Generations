"use server";

import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/db/client";
import { requireRole } from "@/lib/auth";
import { getUserById, setUserStatus } from "@/lib/db/queries/users";
import { isNextControlFlowError } from "@/lib/nextControlFlow";
import { sendSignupApprovedEmail } from "@/lib/notifications/signupApproved";
import { sendSignupRejectedEmail } from "@/lib/notifications/signupRejected";

// Result returned to the client so a failure shows a message instead of
// crashing the page (these actions previously returned void and any throw —
// a transient DB hiccup, an email error — hit the global error boundary).
export type PendingActionResult = { ok: true } | { ok: false; error: string };

// Approve a pending signup. Flips status to 'active', then emails the user.
// The status flip is the actual approval; the notification email is best-effort
// (Resend's free tier only delivers to the account address) and never blocks it.
export async function approvePendingSignupAction(userId: string): Promise<PendingActionResult> {
  try {
    await requireRole("admin");
    if (!isDbConfigured()) return { ok: true };
    const user = await getUserById(userId);
    if (!user) return { ok: false, error: "That user no longer exists." };
    await setUserStatus(userId, "active");
    revalidatePath("/dashboard/admin/pending");
    revalidatePath("/dashboard/admin/users");
    try {
      await sendSignupApprovedEmail({
        email: user.email,
        displayName: user.displayName,
        roleLabel: user.role,
        loginUrl: `https://brigen.org${roleSignInUrl(user.role)}`,
      });
    } catch (err) {
      console.error("[admin/pending] approval email failed (status still updated)", err);
    }
    return { ok: true };
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    console.error("[admin/pending] approve failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not approve." };
  }
}

// Reject a pending signup with optional reason. Flips status to 'rejected'.
export async function rejectPendingSignupAction(
  userId: string,
  formData: FormData,
): Promise<PendingActionResult> {
  try {
    await requireRole("admin");
    if (!isDbConfigured()) return { ok: true };
    const user = await getUserById(userId);
    if (!user) return { ok: false, error: "That user no longer exists." };
    const reason = String(formData.get("reason") ?? "").trim();
    await setUserStatus(userId, "rejected");
    revalidatePath("/dashboard/admin/pending");
    revalidatePath("/dashboard/admin/users");
    try {
      await sendSignupRejectedEmail({
        email: user.email,
        displayName: user.displayName,
        roleLabel: user.role,
        reason: reason || null,
      });
    } catch (err) {
      console.error("[admin/pending] rejection email failed (status still updated)", err);
    }
    return { ok: true };
  } catch (err) {
    if (isNextControlFlowError(err)) throw err;
    console.error("[admin/pending] reject failed", err);
    return { ok: false, error: err instanceof Error ? err.message : "Could not reject." };
  }
}

// Suspend an active user.
export async function suspendUserAction(userId: string): Promise<void> {
  await requireRole("admin");
  if (!isDbConfigured()) return;
  await setUserStatus(userId, "suspended");
  revalidatePath("/dashboard/admin/users");
}

// Bulk approve a set of pending signups. Stops on the first per-user
// failure but reports the count that succeeded so the UI can show a
// meaningful "approved 3 of 5" toast. Emails fire in parallel via
// Promise.allSettled so one stuck SMTP send doesn't block the others.
export async function bulkApprovePendingSignupsAction(
  userIds: string[],
): Promise<{ approved: number; failed: number }> {
  await requireRole("admin");
  if (!isDbConfigured() || userIds.length === 0) return { approved: 0, failed: 0 };

  let approved = 0;
  let failed = 0;
  const emailJobs: Promise<unknown>[] = [];

  for (const id of userIds) {
    try {
      const user = await getUserById(id);
      if (!user || user.status !== "pending") {
        failed++;
        continue;
      }
      await setUserStatus(id, "active");
      emailJobs.push(
        sendSignupApprovedEmail({
          email: user.email,
          displayName: user.displayName,
          roleLabel: user.role,
          loginUrl: `https://brigen.org${roleSignInUrl(user.role)}`,
        }),
      );
      approved++;
    } catch (err) {
      console.error(`[admin/pending] bulk approve failed for ${id}`, err);
      failed++;
    }
  }

  // Fire-and-forget emails. We don't await — the response can return
  // immediately; sendEmail logs to stderr on failure.
  await Promise.allSettled(emailJobs);
  revalidatePath("/dashboard/admin/pending");
  revalidatePath("/dashboard/admin/users");
  return { approved, failed };
}

// Bulk reject. Optional shared reason applies to all — applicants get
// the same note in their rejection email. If no reason is given the
// email omits the "Note from the board" block.
export async function bulkRejectPendingSignupsAction(
  userIds: string[],
  reason: string,
): Promise<{ rejected: number; failed: number }> {
  await requireRole("admin");
  if (!isDbConfigured() || userIds.length === 0) return { rejected: 0, failed: 0 };

  let rejected = 0;
  let failed = 0;
  const trimmed = reason.trim();
  const emailJobs: Promise<unknown>[] = [];

  for (const id of userIds) {
    try {
      const user = await getUserById(id);
      if (!user || user.status !== "pending") {
        failed++;
        continue;
      }
      await setUserStatus(id, "rejected");
      emailJobs.push(
        sendSignupRejectedEmail({
          email: user.email,
          displayName: user.displayName,
          roleLabel: user.role,
          reason: trimmed || null,
        }),
      );
      rejected++;
    } catch (err) {
      console.error(`[admin/pending] bulk reject failed for ${id}`, err);
      failed++;
    }
  }

  await Promise.allSettled(emailJobs);
  revalidatePath("/dashboard/admin/pending");
  revalidatePath("/dashboard/admin/users");
  return { rejected, failed };
}

function roleSignInUrl(role: string): string {
  switch (role) {
    case "admin":
    case "it":
      return "/admin-login";
    case "mentor":
      return "/mentor-login";
    case "student":
      return "/student-login";
    case "accountant":
      return "/accountant-login";
    case "media":
      return "/media-login";
    default:
      return "/sign-in";
  }
}
