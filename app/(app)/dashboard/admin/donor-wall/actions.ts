"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import {
  addContribution,
  createFeaturedDonor,
  deleteContribution,
  deleteFeaturedDonor,
  updateFeaturedDonor,
} from "@/lib/db/queries/featuredDonors";
import { centsFromDollarsInput } from "@/lib/donor/featured";

const LIST = "/dashboard/admin/donor-wall";

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function intOrNull(formData: FormData, key: string): number | null {
  const raw = str(formData, key);
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

// Create a donor from just a name, then jump straight into its editor.
export async function createDonorAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const name = str(formData, "name");
  if (!name) return;
  const donor = await createFeaturedDonor({ name });
  revalidatePath(LIST);
  redirect(`${LIST}/${donor.id}`);
}

export async function saveDonorAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  const name = str(formData, "name");
  // Photo is managed separately by the upload endpoint, so it's intentionally
  // not touched here — saving details must never wipe an uploaded photo.
  await updateFeaturedDonor(id, {
    ...(name ? { name } : {}),
    blurb: str(formData, "blurb") || null,
    published: formData.get("published") != null,
    displayOrder: intOrNull(formData, "displayOrder") ?? 0,
  });
  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  revalidatePath("/donors");
}

export async function removeDonorPhotoAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  await updateFeaturedDonor(id, { photoUrl: null });
  revalidatePath(`${LIST}/${id}`);
  revalidatePath(LIST);
  revalidatePath("/donors");
}

export async function deleteDonorAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  if (!id) return;
  await deleteFeaturedDonor(id);
  revalidatePath(LIST);
  revalidatePath("/donors");
  redirect(LIST);
}

export async function addContributionAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const donorId = str(formData, "donorId");
  const studentName = str(formData, "studentName");
  const amountCents = centsFromDollarsInput(str(formData, "amount"));
  if (!donorId || !studentName || amountCents == null) return;
  // "when" is an <input type="month"> value like "2024-12".
  let year: number | null = null;
  let month: number | null = null;
  const when = /^(\d{4})-(\d{2})$/.exec(str(formData, "when"));
  if (when) {
    year = Number(when[1]);
    month = Number(when[2]);
  }
  await addContribution({
    donorId,
    studentName,
    studentRef: str(formData, "studentRef") || null,
    amountCents,
    year,
    month,
  });
  revalidatePath(`${LIST}/${donorId}`);
  revalidatePath(LIST);
  revalidatePath("/donors");
}

export async function deleteContributionAction(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = str(formData, "id");
  const donorId = str(formData, "donorId");
  if (!id) return;
  await deleteContribution(id);
  if (donorId) revalidatePath(`${LIST}/${donorId}`);
  revalidatePath(LIST);
  revalidatePath("/donors");
}
