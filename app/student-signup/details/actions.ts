"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, isDbConfigured } from "@/db/client";
import { studentRegistrations, users } from "@/db/schema";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { sendEmail } from "@/lib/forms/server";

export type StudentApplicationState = { ok: true } | { ok: false; error: string };

// Persists a fresh scholarship application tied to the signed-in Clerk user.
// Also flips the user's role to "student" so the student dashboard becomes
// the right destination. Admin reviews + approves later from /dashboard/admin
// and links the account to a Keystatic slug.

export async function submitStudentApplicationAction(
  _prev: StudentApplicationState | null,
  formData: FormData,
): Promise<StudentApplicationState> {
  await requireUserId();

  const studentName = String(formData.get("studentName") ?? "")
    .trim()
    .slice(0, 120);
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "")
    .trim()
    .slice(0, 40);
  const grade = String(formData.get("grade") ?? "")
    .trim()
    .slice(0, 40);
  const school = String(formData.get("school") ?? "")
    .trim()
    .slice(0, 200);
  const ethnicity = String(formData.get("ethnicity") ?? "")
    .trim()
    .slice(0, 80);
  const isOrphan = formData.get("isOrphan") === "on";
  const guardianName = String(formData.get("guardianName") ?? "")
    .trim()
    .slice(0, 120);
  const guardianRelation = String(formData.get("guardianRelation") ?? "")
    .trim()
    .slice(0, 80);
  const guardianOccupation = String(formData.get("guardianOccupation") ?? "")
    .trim()
    .slice(0, 200);
  const familyIncome = String(formData.get("familyIncome") ?? "")
    .trim()
    .slice(0, 80);
  const address = String(formData.get("address") ?? "")
    .trim()
    .slice(0, 2000);
  const phone = String(formData.get("phone") ?? "")
    .trim()
    .slice(0, 40);
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 255);
  const message = String(formData.get("message") ?? "")
    .trim()
    .slice(0, 4000);
  const hobby = String(formData.get("hobby") ?? "")
    .trim()
    .slice(0, 200);
  const lifeTarget = String(formData.get("lifeTarget") ?? "")
    .trim()
    .slice(0, 1000);

  if (!studentName) return { ok: false, error: "Your name is required." };
  if (!grade) return { ok: false, error: "Grade is required." };
  if (!school) return { ok: false, error: "School name is required." };
  if (!guardianName) return { ok: false, error: "Guardian name is required." };
  if (!address) return { ok: false, error: "Home address is required." };
  if (!message) return { ok: false, error: "Tell us a bit about why you're applying." };

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
      studentName,
      dateOfBirth: dateOfBirth || null,
      grade,
      school,
      ethnicity: ethnicity || null,
      isOrphan,
      guardianName,
      guardianRelation: guardianRelation || null,
      guardianOccupation: guardianOccupation || null,
      familyIncome: familyIncome || null,
      address,
      phone: phone || null,
      email: email || dbUser.email,
      message,
      hobby: hobby || null,
      lifeTarget: lifeTarget || null,
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
  // here don't block the signup flow; sendEmail logs to stderr in that case.
  const applicantEmail = email || dbUser.email;
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
        "In the meantime you can sign in at any time to see your application status:",
        "https://brigen.org/student-login",
        "",
        "If you have questions, just reply to this email.",
        "",
        "— Bridging Generations",
      ].join("\n"),
    }),
    sendEmail({
      to: orgEmail,
      subject: `New student application · ${studentName}`,
      text: [
        `${studentName} just submitted a scholarship application.`,
        "",
        `Grade: ${grade}`,
        `School: ${school}`,
        `Guardian: ${guardianName}`,
        `Contact: ${applicantEmail}${phone ? " · " + phone : ""}`,
        "",
        "Review in the admin queue: https://brigen.org/dashboard/admin",
      ].join("\n"),
      replyTo: applicantEmail,
    }),
  ]);

  redirect("/student-login?welcome=1");
}
