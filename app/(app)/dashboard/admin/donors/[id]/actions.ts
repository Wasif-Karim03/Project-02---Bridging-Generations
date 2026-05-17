"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { upsertDonorProfile } from "@/lib/db/queries/donorProfiles";
import { getUserById, setUserRole } from "@/lib/db/queries/users";
import { sendMentorApprovalEmail } from "@/lib/notifications/mentorApproval";

// Admin can edit any donor's public profile fields. This is a privileged
// action — requireRole("admin") enforces it. The donor themselves edits
// their own profile via /dashboard/donor/profile (a different action that
// only lets them touch their OWN row).

export async function adminUpdateDonorProfileAction(
  donorUserId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");

  if (!donorUserId || donorUserId.length > 64) {
    return { ok: false, error: "Invalid donor id." };
  }

  const legalName = String(formData.get("legalName") ?? "").slice(0, 200);
  const publicInitials = String(formData.get("publicInitials") ?? "").slice(0, 8);
  const anonymous = formData.get("anonymous") === "on";
  const dedicationText = String(formData.get("dedicationText") ?? "").slice(0, 280);

  try {
    await upsertDonorProfile(donorUserId, {
      legalName,
      publicInitials,
      anonymous,
      dedicationText,
    });
    revalidatePath(`/dashboard/admin/donors/${donorUserId}`);
    revalidatePath("/dashboard/admin");
    revalidatePath("/donors");
    return { ok: true };
  } catch (err) {
    console.error("[admin/donors/edit] upsert failed", err);
    return { ok: false, error: "Could not save changes. Please try again." };
  }
}

// Admin can also flip a donor's role from this screen — useful when they
// want to deactivate (set back to "anonymous") or escalate a long-time
// donor to mentor / admin without leaving the detail page.
export async function adminSetDonorRoleAction(
  donorUserId: string,
  role: "anonymous" | "donor" | "mentor" | "admin" | "it" | "student",
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  if (!donorUserId) return { ok: false, error: "Invalid donor id." };
  const prev = await getUserById(donorUserId);
  const wasMentor = prev?.role === "mentor";

  if (role === "anonymous") {
    // setUserRole expects one of the active roles; "anonymous" deactivates.
    // For now treat it the same — schema enum includes anonymous so the cast
    // is safe at the SQL layer.
    try {
      // biome-ignore lint/suspicious/noExplicitAny: enum cast for deactivation
      await (setUserRole as any)(donorUserId, role);
    } catch (err) {
      console.error("[admin/donors/role] deactivate failed", err);
      return { ok: false, error: "Could not deactivate account." };
    }
  } else {
    try {
      await setUserRole(donorUserId, role);
    } catch (err) {
      console.error("[admin/donors/role] set failed", err);
      return { ok: false, error: "Could not update role." };
    }
  }

  // Same approval email as /dashboard/admin/users — fires on the first
  // non-mentor → mentor transition only. Identical wording so the donor's
  // experience doesn't depend on which admin screen made the change.
  if (role === "mentor" && !wasMentor && prev?.email) {
    await sendMentorApprovalEmail({ email: prev.email, displayName: prev.displayName });
  }

  revalidatePath(`/dashboard/admin/donors/${donorUserId}`);
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/mentors");
  return { ok: true };
}
