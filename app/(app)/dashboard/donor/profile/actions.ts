"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth";
import { type DonorProfileShape, upsertDonorProfile } from "@/lib/db/queries/donorProfiles";

export type SaveProfileResult = {
  status: "success" | "error";
  message: string;
};

export async function saveDonorProfileAction(
  patch: Partial<DonorProfileShape>,
): Promise<SaveProfileResult> {
  const userId = await requireUserId();
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
