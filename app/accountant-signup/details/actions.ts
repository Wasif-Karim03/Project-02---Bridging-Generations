"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { insertAccountantProfile } from "@/lib/db/queries/accountantProfile";
import { sendEmail } from "@/lib/forms/server";

export type AccountantSignupState = { ok: true } | { ok: false; error: string } | null;

// Server action — handles step 2 of accountant signup. Inserts the profile
// row + flips users.role from 'donor' to 'accountant'. Status stays
// 'pending' so an admin can still gate the actual approval.
export async function submitAccountantSignupAction(
  _prev: AccountantSignupState,
  formData: FormData,
): Promise<AccountantSignupState> {
  await requireUserId();

  // Preview mode (no DB) — fake success so the UX is reviewable without
  // backend wiring.
  if (!isDbConfigured()) {
    redirect("/pending-approval");
  }

  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { ok: false, error: "Account lookup failed. Please sign in again." };
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const expectedEndDate = String(formData.get("expectedEndDate") ?? "").trim();
  const whyAccountant = String(formData.get("whyAccountant") ?? "").trim();

  // Honeypot — public form pattern in this codebase, see contact form
  if (formData.get("company")) return { ok: true };

  if (!fullName) return { ok: false, error: "Please share your full name." };
  if (!whyAccountant) {
    return {
      ok: false,
      error: "Please share a few sentences about why you want to be an accountant.",
    };
  }

  const db = getDb();
  try {
    await insertAccountantProfile({
      userId: dbUser.id,
      fullName,
      phone: phone || null,
      address: address || null,
      photoUrl: photoUrl || null,
      startDate: startDate || null,
      expectedEndDate: expectedEndDate || null,
      whyAccountant: whyAccountant || null,
    });
    // Flip role from donor (default) to accountant so the admin queue
    // and role pickers surface it correctly. Status stays 'pending'.
    await db
      .update(users)
      .set({
        role: "accountant",
        phone: phone || dbUser.phone,
        updatedAt: new Date(),
      })
      .where(eq(users.id, dbUser.id));
  } catch (err) {
    console.error("[accountant/signup] insert failed", err);
    return {
      ok: false,
      error: "Could not save your details. Please try again.",
    };
  }

  // Fire-and-forget notify the org email about the new application.
  const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
  await sendEmail({
    to: dbUser.email,
    subject: "Your Bridging Generations accountant application is in",
    text: [
      `Hi ${dbUser.displayName ?? fullName ?? "there"},`,
      "",
      "Thank you for applying to join Bridging Generations as an accountant.",
      "We've received your application — an admin will review it and reach out by email.",
      "",
      "While you wait, you can close this tab. You'll get another email when a decision is made.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
  await sendEmail({
    to: orgEmail,
    subject: `New accountant application · ${fullName}`,
    text: [
      `${fullName} just submitted an accountant application.`,
      "",
      `Email: ${dbUser.email}`,
      phone ? `Phone: ${phone}` : "Phone: (not provided)",
      "",
      "Review in the admin queue: https://brigen.org/dashboard/admin",
    ].join("\n"),
  });

  redirect("/pending-approval");
}
