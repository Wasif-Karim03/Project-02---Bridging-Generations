"use server";

import { revalidatePath } from "next/cache";
import { isDbConfigured } from "@/db/client";
import { dashboardForRole, requireRole } from "@/lib/auth";
import { getUserById, setUserStatus } from "@/lib/db/queries/users";
import { sendSignupApprovedEmail } from "@/lib/notifications/signupApproved";
import { sendSignupRejectedEmail } from "@/lib/notifications/signupRejected";

// Approve a pending signup. Flips status to 'active', then emails the user.
export async function approvePendingSignupAction(userId: string): Promise<void> {
  await requireRole("admin");
  if (!isDbConfigured()) return;
  const user = await getUserById(userId);
  if (!user) return;
  await setUserStatus(userId, "active");
  revalidatePath("/dashboard/admin/pending");
  revalidatePath("/dashboard/admin/users");
  const loginPath = dashboardForRole(user.role).replace("/dashboard/", "/").replace(/^\//, "/");
  // Map roles to their actual sign-in URLs.
  const signInUrl = roleSignInUrl(user.role);
  await sendSignupApprovedEmail({
    email: user.email,
    displayName: user.displayName,
    roleLabel: user.role,
    loginUrl: `https://brigen.org${signInUrl}`,
  });
  // loginPath silencer — unused here, the function exports a single arg
  void loginPath;
}

// Reject a pending signup with optional reason. Flips status to 'rejected'.
export async function rejectPendingSignupAction(userId: string, formData: FormData): Promise<void> {
  await requireRole("admin");
  if (!isDbConfigured()) return;
  const user = await getUserById(userId);
  if (!user) return;
  const reason = String(formData.get("reason") ?? "").trim();
  await setUserStatus(userId, "rejected");
  revalidatePath("/dashboard/admin/pending");
  revalidatePath("/dashboard/admin/users");
  await sendSignupRejectedEmail({
    email: user.email,
    displayName: user.displayName,
    roleLabel: user.role,
    reason: reason || null,
  });
}

// Suspend an active user.
export async function suspendUserAction(userId: string): Promise<void> {
  await requireRole("admin");
  if (!isDbConfigured()) return;
  await setUserStatus(userId, "suspended");
  revalidatePath("/dashboard/admin/users");
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
