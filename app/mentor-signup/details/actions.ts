"use server";

import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { mentorApplications } from "@/db/schema";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { readUploadedPhoto } from "@/lib/forms/photoUpload";
import { sendEmail } from "@/lib/forms/server";

export type MentorApplicationState = { ok: true } | { ok: false; error: string };

// Persists a mentor application tied to the signed-in Clerk user.
// Mirror of submitStudentApplicationAction in /student-signup/details.
// User stays role=donor / status=pending until an admin approves the
// mentor_applications row from /dashboard/admin/applications.

export async function submitMentorApplicationAction(
  _prev: MentorApplicationState | null,
  formData: FormData,
): Promise<MentorApplicationState> {
  await requireUserId();

  const name = String(formData.get("name") ?? "")
    .trim()
    .slice(0, 120);
  const phone = String(formData.get("phone") ?? "")
    .trim()
    .slice(0, 40);
  const address = String(formData.get("address") ?? "")
    .trim()
    .slice(0, 2000);
  const country = String(formData.get("country") ?? "")
    .trim()
    .slice(0, 80);
  const occupation = String(formData.get("occupation") ?? "")
    .trim()
    .slice(0, 200);
  const educationStatus = String(formData.get("educationStatus") ?? "")
    .trim()
    .slice(0, 200);
  const classOrYear = String(formData.get("classOrYear") ?? "")
    .trim()
    .slice(0, 120);
  const photoUrl = String(formData.get("photoUrl") ?? "")
    .trim()
    .slice(0, 2000);
  const subjects = String(formData.get("subjects") ?? "")
    .trim()
    .slice(0, 400);
  const hoursPerWeek = String(formData.get("hoursPerWeek") ?? "")
    .trim()
    .slice(0, 40);
  const startTerm = String(formData.get("startTerm") ?? "")
    .trim()
    .slice(0, 80);
  const grades = String(formData.get("grades") ?? "")
    .trim()
    .slice(0, 120);
  const startDate = String(formData.get("startDate") ?? "")
    .trim()
    .slice(0, 40);
  const expectedEndDate = String(formData.get("expectedEndDate") ?? "")
    .trim()
    .slice(0, 40);
  const whyMentor = String(formData.get("whyMentor") ?? "")
    .trim()
    .slice(0, 4000);
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 255);

  if (!name) return { ok: false, error: "Your full name is required." };
  if (!phone) return { ok: false, error: "A phone number is required so we can reach you." };
  if (!address) return { ok: false, error: "Your address is required." };
  if (!educationStatus) {
    return { ok: false, error: "Tell us your school / college / university." };
  }
  if (!occupation) return { ok: false, error: "Your profession is required." };
  if (!subjects) return { ok: false, error: "List at least one subject you can mentor." };
  if (!whyMentor) {
    return { ok: false, error: "Tell us why you want to mentor — a few sentences is plenty." };
  }

  // Optional photo URL — if provided, validate it parses as a URL so we don't
  // store obviously broken values. Empty string is fine.
  if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
    return { ok: false, error: "Photo URL must start with http:// or https://." };
  }

  const photo = await readUploadedPhoto(formData, "photo");
  if (photo && "error" in photo) return { ok: false, error: photo.error };

  if (!isDbConfigured()) {
    redirect("/pending-approval?application=mentor");
  }

  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { ok: false, error: "Account lookup failed. Please sign in again." };
  }

  const applicantEmail = email || dbUser.email;

  try {
    await getDb()
      .insert(mentorApplications)
      .values({
        applicantUserId: dbUser.id,
        name,
        email: applicantEmail,
        phone,
        address,
        country: country || null,
        occupation,
        educationStatus,
        classOrYear: classOrYear || null,
        grades: grades || null,
        photoUrl: photoUrl || null,
        photoData: photo?.data ?? null,
        photoMimeType: photo?.mime ?? null,
        subjects,
        hoursPerWeek: hoursPerWeek || null,
        startTerm: startTerm || null,
        startDate: startDate || null,
        expectedEndDate: expectedEndDate || null,
        whyMentor,
      });
  } catch (err) {
    console.error("[mentor/apply] insert failed", err);
    return { ok: false, error: "Could not save your application. Please try again." };
  }

  // Fire-and-forget confirmation emails. Failures don't block the redirect.
  const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
  await Promise.allSettled([
    sendEmail({
      to: applicantEmail,
      subject: "Your Bridging Generations mentor application is in",
      text: [
        `Hi ${name},`,
        "",
        "Thank you for offering to mentor with Bridging Generations. We've received your",
        "application and our team will review it within a few days. You'll get another email",
        "here as soon as a decision is made.",
        "",
        "You can sign in any time to check status — your dashboard will let you know once",
        "you're approved as a mentor.",
        "",
        "If you have questions, just reply to this email.",
        "",
        "— Bridging Generations",
      ].join("\n"),
    }),
    sendEmail({
      to: orgEmail,
      subject: `New mentor application · ${name}`,
      text: [
        `${name} just submitted a mentor application.`,
        "",
        `Email: ${applicantEmail}`,
        `Phone: ${phone}`,
        `Address: ${address}`,
        country ? `Country: ${country}` : null,
        `Profession: ${occupation}`,
        `Education: ${educationStatus}${classOrYear ? ` · ${classOrYear}` : ""}`,
        `Subjects: ${subjects}`,
        hoursPerWeek ? `Availability: ${hoursPerWeek}` : null,
        startTerm ? `Start: ${startTerm}` : null,
        photoUrl ? `Photo: ${photoUrl}` : null,
        "",
        "Review in the admin queue:",
        "https://bridging-generations.vercel.app/dashboard/admin/applications",
      ]
        .filter(Boolean)
        .join("\n"),
      replyTo: applicantEmail,
    }),
  ]);

  redirect("/pending-approval?application=mentor");
}
