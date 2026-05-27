"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { users } from "@/db/schema";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { insertMediaProfile } from "@/lib/db/queries/mediaFolders";
import { sendEmail } from "@/lib/forms/server";

export type MediaSignupState = { ok: true } | { ok: false; error: string } | null;

export async function submitMediaSignupAction(
  _prev: MediaSignupState,
  formData: FormData,
): Promise<MediaSignupState> {
  await requireUserId();
  if (!isDbConfigured()) redirect("/pending-approval");

  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { ok: false, error: "Account lookup failed. Please sign in again." };

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const startDate = String(formData.get("startDate") ?? "").trim();
  const expectedEndDate = String(formData.get("expectedEndDate") ?? "").trim();
  const whyMedia = String(formData.get("whyMedia") ?? "").trim();

  if (formData.get("company")) return { ok: true };

  if (!fullName) return { ok: false, error: "Please share your full name." };
  if (!whyMedia)
    return { ok: false, error: "Please share a few sentences about why you want to join media." };

  const db = getDb();
  try {
    await insertMediaProfile({
      userId: dbUser.id,
      fullName,
      phone: phone || null,
      address: address || null,
      photoUrl: photoUrl || null,
      startDate: startDate || null,
      expectedEndDate: expectedEndDate || null,
      whyMedia: whyMedia || null,
    });
    await db
      .update(users)
      .set({ role: "media", phone: phone || dbUser.phone, updatedAt: new Date() })
      .where(eq(users.id, dbUser.id));
  } catch (err) {
    console.error("[media/signup] insert failed", err);
    return { ok: false, error: "Could not save your details. Please try again." };
  }

  const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
  await sendEmail({
    to: dbUser.email,
    subject: "Your Bridging Generations media application is in",
    text: [
      `Hi ${dbUser.displayName ?? fullName ?? "there"},`,
      "",
      "Thank you for applying to join the Bridging Generations media team.",
      "An admin will review your application and email you when a decision is made.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
  await sendEmail({
    to: orgEmail,
    subject: `New media application · ${fullName}`,
    text: [
      `${fullName} just submitted a media application.`,
      `Email: ${dbUser.email}`,
      phone ? `Phone: ${phone}` : "Phone: (not provided)",
      "",
      "Review in the admin queue: https://brigen.org/dashboard/admin",
    ].join("\n"),
  });

  redirect("/pending-approval");
}
