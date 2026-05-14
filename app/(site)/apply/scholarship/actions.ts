"use server";

import { getContactPage } from "@/lib/content/contactPage";
import { insertScholarshipApplication } from "@/lib/db/queries/applications";
import { type FormActionState, isValidEmail, lengthError } from "@/lib/forms";
import { clientIp, sendEmail, takeRateSlot } from "@/lib/forms/server";

const RATE_KEY = "scholarshipApplication";

export async function submitScholarshipApplication(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const applicantName = String(formData.get("applicantName") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const village = String(formData.get("village") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const familyIncome = String(formData.get("familyIncome") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Thank you — your application has been received.",
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!applicantName) fieldErrors.applicantName = "Applicant name is required.";
  else if (applicantName.length > 100)
    fieldErrors.applicantName = "Name must be 100 characters or less.";
  if (!email) fieldErrors.email = "Email is required.";
  else if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (!school) fieldErrors.school = "School is required.";
  if (!grade) fieldErrors.grade = "Current grade is required.";
  if (!message) fieldErrors.message = "Please describe why you're applying.";
  else {
    const e = lengthError("Message", message, 2000);
    if (e) fieldErrors.message = e;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const ip = await clientIp();
  if (!takeRateSlot(ip, { key: RATE_KEY, max: 3, windowMs: 10 * 60 * 1000 })) {
    return {
      status: "error",
      message: "Too many submissions in a short window. Please wait a few minutes and try again.",
      fieldErrors: {},
    };
  }

  const contactPage = await getContactPage();
  const subject = `[BG-SCHOLARSHIP] ${applicantName} — Grade ${grade}`;
  const body = [
    `Applicant: ${applicantName}`,
    guardianName ? `Guardian: ${guardianName}` : null,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `School: ${school}`,
    `Grade: ${grade}`,
    village ? `Village: ${village}` : null,
    region ? `Region: ${region}` : null,
    familyIncome ? `Approx. family income (monthly): ${familyIncome}` : null,
    "",
    "Why applying:",
    message,
  ]
    .filter(Boolean)
    .join("\n");

  const ok = await sendEmail({
    to: contactPage.destinationEmail,
    subject,
    text: body,
    replyTo: email,
  });

  if (!ok) {
    return {
      status: "error",
      message:
        "Something went wrong on our end. Please try again, or email bridginggeneration20@gmail.com directly.",
      fieldErrors: {},
    };
  }

  // Persist to DB when configured. No-op + null return when DATABASE_URL
  // isn't set — the email is the authoritative record in that case.
  // Failures here are logged but don't block the success response since the
  // email has already gone out.
  try {
    await insertScholarshipApplication({
      applicantName,
      guardianName: guardianName || undefined,
      email,
      phone: phone || undefined,
      school,
      grade,
      village: village || undefined,
      region: region || undefined,
      familyIncome: familyIncome || undefined,
      message,
    });
  } catch (err) {
    console.error("[apply/scholarship] DB persist failed (email already sent)", err);
  }

  return {
    status: "success",
    message:
      "Application received. The board reviews every application within four weeks — we'll be in touch by email.",
    fieldErrors: {},
    submittedEmail: email,
  };
}
