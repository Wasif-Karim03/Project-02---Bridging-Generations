"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { type DonorProfileShape, upsertDonorProfile } from "@/lib/db/queries/donorProfiles";

export type SaveProfileResult = {
  status: "success" | "error";
  message: string;
};

export async function saveDonorProfileAction(
  patch: Partial<DonorProfileShape>,
): Promise<SaveProfileResult> {
  // requireRole("donor") enforces sign-in + the donor role + status=active,
  // so a non-donor (or a not-yet-approved donor) can't write a donor profile.
  const { userId } = await requireRole("donor");
  try {
    await upsertDonorProfile(userId, patch);
    revalidatePath("/dashboard/donor/profile");
    revalidatePath("/donors");
    return {
      status: "success",
      message: "Profile saved.",
    };
  } catch (err) {
    console.error("[donor/profile/save] failed", err);
    return {
      status: "error",
      message: "Could not save your profile right now. Please try again — your data wasn't lost.",
    };
  }
}
