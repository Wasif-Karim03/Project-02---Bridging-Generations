"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { setUserRole } from "@/lib/db/queries/users";

export type RoleChangeResult = {
  status: "success" | "error";
  message: string;
};

// Promote / demote a user. Admin-only. Roles: donor / mentor / admin / it.
export async function setUserRoleAction(
  userId: string,
  role: "donor" | "mentor" | "admin" | "it",
): Promise<RoleChangeResult> {
  await requireRole("admin");
  try {
    await setUserRole(userId, role);
    revalidatePath("/dashboard/admin/users");
    return { status: "success", message: `Role set to ${role}.` };
  } catch (err) {
    console.error("[admin/users/setRole] failed", err);
    return { status: "error", message: "Could not update role. Try again." };
  }
}
