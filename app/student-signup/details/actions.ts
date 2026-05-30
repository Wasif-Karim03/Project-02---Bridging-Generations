"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { studentRegistrations, users } from "@/db/schema";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { sendEmail } from "@/lib/forms/server";
import { studentCodeForUuid } from "@/lib/student/studentCode";

export type StudentApplicationState = { ok: true } | { ok: false; error: string };

// Max passport photo size accepted from the form, in bytes. Stored as base64
// in Postgres (private — never the public repo). 3MB is generous for a phone
// photo while keeping rows from bloating the free-tier DB.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

// Persists a full scholarship application (mirroring the org's paper form) tied
// to the signed-in Clerk user, and flips the user's role to "student". Admin
// reviews + approves later from /dashboard/admin/students and links the account
// to a Keystatic slug.

function field(formData: FormData, name: string, max: number): string {
  return String(formData.get(name) ?? "")
    .trim()
    .slice(0, max);
}

async function readPhoto(
  formData: FormData,
): Promise<{ data: string; mime: string } | { error: string } | null> {
  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) return null;
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is larger than 4MB. Please use a smaller image." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
    return { error: "Photo must be a JPG, PNG, or WebP image." };
  }
  const buf = Buffer.from(await photo.arrayBuffer());
  return { data: buf.toString("base64"), mime: photo.type };
}

export async function submitStudentApplicationAction(
  _prev: StudentApplicationState | null,
  formData: FormData,
): Promise<StudentApplicationState> {
  await requireUserId();

  // Student details
  const registrationNo = field(formData, "registrationNo", 60);
  const studentName = field(formData, "studentName", 120);
  const gender = field(formData, "gender", 20);
  const dateOfBirth = field(formData, "dateOfBirth", 40);
  const ethnicity = field(formData, "ethnicity", 80);
  const isOrphan = formData.get("isOrphan") === "yes" || formData.get("isOrphan") === "on";

  // Parents
  const fatherName = field(formData, "fatherName", 120);
  const motherName = field(formData, "motherName", 120);
  const parentsContact = field(formData, "parentsContact", 40);

  // Address
  const village = field(formData, "village", 200);
  const postOffice = field(formData, "postOffice", 160);
  const policeStation = field(formData, "policeStation", 160);
  const district = field(formData, "district", 120);

  // Academic
  const grade = field(formData, "grade", 40);
  const currentRollNo = field(formData, "currentRollNo", 60);
  const formerRollNo = field(formData, "formerRollNo", 60);
  const totalStudents = field(formData, "totalStudents", 40);
  const school = field(formData, "school", 200);

  // Family / financial
  const fatherProfession = field(formData, "fatherProfession", 160);
  const motherProfession = field(formData, "motherProfession", 160);
  const familyIncome = field(formData, "familyIncome", 80);
  const purpose = field(formData, "purpose", 2000);
  const requiredAmount = field(formData, "requiredAmount", 60);

  // Amount nature
  const amountNature = field(formData, "amountNature", 20);
  const perInstallment = field(formData, "perInstallment", 60);
  const durationValue = field(formData, "durationValue", 40);
  const durationUnit = field(formData, "durationUnit", 20);

  // Guardian
  const guardianName = field(formData, "guardianName", 120);
  const guardianPhone = field(formData, "guardianPhone", 40);
  const guardianAddress = field(formData, "guardianAddress", 2000);

  // Other
  const phone = field(formData, "phone", 40);
  const email = field(formData, "email", 255);
  const message = field(formData, "message", 4000);
  const studentSignature = field(formData, "studentSignature", 160);

  if (!studentName) return { ok: false, error: "Full name is required." };
  if (!grade) return { ok: false, error: "Class is required." };
  if (!school) return { ok: false, error: "School / institute is required." };

  const photo = await readPhoto(formData);
  if (photo && "error" in photo) return { ok: false, error: photo.error };

  // The `address` column is NOT NULL and is what older views render; compose it
  // from the structured parts so both stay in sync.
  const composedAddress =
    [village, postOffice, policeStation, district].filter(Boolean).join(", ") || "—";

  if (!isDbConfigured()) {
    // Preview mode: no DB to write into. Pretend it succeeded so the rest of
    // the flow is demoable.
    redirect("/student-login?welcome=1");
  }

  const dbUser = await getCurrentDbUser();
  if (!dbUser) {
    return { ok: false, error: "Account lookup failed. Please sign in again." };
  }

  const db = getDb();
  try {
    await db.insert(studentRegistrations).values({
      applicantUserId: dbUser.id,
      registrationNo: registrationNo || null,
      studentName,
      gender: gender || null,
      dateOfBirth: dateOfBirth || null,
      ethnicity: ethnicity || null,
      isOrphan,
      fatherName: fatherName || null,
      motherName: motherName || null,
      parentsContact: parentsContact || null,
      fatherProfession: fatherProfession || null,
      motherProfession: motherProfession || null,
      village: village || null,
      postOffice: postOffice || null,
      policeStation: policeStation || null,
      district: district || null,
      address: composedAddress,
      grade,
      currentRollNo: currentRollNo || null,
      formerRollNo: formerRollNo || null,
      totalStudents: totalStudents || null,
      school,
      familyIncome: familyIncome || null,
      purpose: purpose || null,
      requiredAmount: requiredAmount || null,
      amountNature: amountNature || null,
      perInstallment: perInstallment || null,
      durationValue: durationValue || null,
      durationUnit: durationUnit || null,
      guardianName: guardianName || "—",
      guardianPhone: guardianPhone || parentsContact || null,
      guardianAddress: guardianAddress || null,
      phone: phone || null,
      email: email || dbUser.email,
      message: message || null,
      studentSignature: studentSignature || null,
      photoData: photo?.data ?? null,
      photoMimeType: photo?.mime ?? null,
    });
    // Promote the user to role=student so they land on the right dashboard.
    await db
      .update(users)
      .set({ role: "student", updatedAt: new Date() })
      .where(eq(users.id, dbUser.id));
  } catch (err) {
    console.error("[student/apply] insert failed", err);
    return {
      ok: false,
      error: "Could not save your application. Please try again.",
    };
  }

  // Fire-and-forget confirmation emails — applicant + board notify. Failures
  // here don't block the signup flow.
  const applicantEmail = email || dbUser.email;
  const studentCode = studentCodeForUuid(dbUser.id);
  const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
  await Promise.allSettled([
    sendEmail({
      to: applicantEmail,
      subject: "Your Bridging Generations application is in",
      text: [
        `Hi ${studentName},`,
        "",
        "Thank you for applying to Bridging Generations. We've received your application and",
        "the board will review it within four weeks. You'll get another email here as soon as a",
        "decision is made.",
        "",
        `Your Student ID: ${studentCode}`,
        "",
        "Save this ID — once your account is fully active you can use it (or your email or",
        "phone number) to sign in. You can always find it on your dashboard too.",
        "",
        "Sign in any time to check your application status:",
        "https://brigen.org/student-login",
        "",
        "If you have questions, just reply to this email.",
        "",
        "— Bridging Generations",
      ].join("\n"),
    }),
    sendEmail({
      to: orgEmail,
      subject: `New student application · ${studentName} (${studentCode})`,
      text: [
        `${studentName} just submitted a scholarship application.`,
        "",
        `Student ID: ${studentCode}`,
        `Class: ${grade}`,
        `School: ${school}`,
        `Guardian: ${guardianName || "—"}${guardianPhone ? ` · ${guardianPhone}` : ""}`,
        `Required amount: ${requiredAmount || "—"}`,
        `Contact: ${applicantEmail}${phone ? ` · ${phone}` : ""}`,
        "",
        "Review in the admin queue: https://brigen.org/dashboard/admin/students",
      ].join("\n"),
      replyTo: applicantEmail,
    }),
  ]);

  redirect("/student-login?welcome=1");
}
