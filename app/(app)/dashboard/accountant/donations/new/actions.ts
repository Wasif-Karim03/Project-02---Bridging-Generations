"use server";

import { redirect } from "next/navigation";
import { isDbConfigured } from "@/db/client";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import { insertManualDonation } from "@/lib/db/queries/manualDonations";

export type NewDonationState = { ok: true } | { ok: false; error: string } | null;

export async function recordManualDonationAction(
  _prev: NewDonationState,
  formData: FormData,
): Promise<NewDonationState> {
  await requireRole("accountant");

  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured." };
  }

  const recorder = await getCurrentDbUser();
  if (!recorder) return { ok: false, error: "Account lookup failed." };

  const donorName = String(formData.get("donorName") ?? "").trim();
  const donorEmail = String(formData.get("donorEmail") ?? "").trim();
  const amountUsdRaw = String(formData.get("amountUsd") ?? "").trim();
  const occurredAtRaw = String(formData.get("occurredAt") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim();
  const studentSlug = String(formData.get("studentSlug") ?? "").trim();
  const projectSlug = String(formData.get("projectSlug") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const amountUsd = Number(amountUsdRaw);
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    return { ok: false, error: "Enter a valid amount greater than zero." };
  }
  if (!method) return { ok: false, error: "Pick a payment method." };
  if (!occurredAtRaw) return { ok: false, error: "Enter the gift date." };

  const amountCents = Math.round(amountUsd * 100);
  const occurredAt = new Date(occurredAtRaw);
  if (Number.isNaN(occurredAt.getTime())) {
    return { ok: false, error: "Could not parse the gift date." };
  }

  try {
    await insertManualDonation({
      recordedBy: recorder.id,
      occurredAt,
      donorEmail: donorEmail || null,
      donorName: donorName || null,
      donorUserId: null,
      amountCents,
      currency: "usd",
      method,
      studentSlug: studentSlug || null,
      projectSlug: projectSlug || null,
      notes: notes || null,
    });
  } catch (err) {
    console.error("[accountant/new-donation] insert failed", err);
    return { ok: false, error: "Could not save the entry. Try again." };
  }

  redirect("/dashboard/accountant");
}
