"use server";

import { getContactPage } from "@/lib/content/contactPage";
import { insertStudentRegistration } from "@/lib/db/queries/applications";
import { type FormActionState, isValidEmail, lengthError } from "@/lib/forms";
import { clientIp, sendEmail, takeRateSlot } from "@/lib/forms/server";

const RATE_KEY = "studentSponsorshipApplication";

export async function submitStudentSponsorshipApplication(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const studentName = String(formData.get("studentName") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const ethnicity = String(formData.get("ethnicity") ?? "").trim();
  const guardianName = String(formData.get("guardianName") ?? "").trim();
  const guardianRelation = String(formData.get("guardianRelation") ?? "").trim();
  const guardianOccupation = String(formData.get("guardianOccupation") ?? "").trim();
  const familyIncome = String(formData.get("familyIncome") ?? "").trim();
  const isOrphan = formData.get("isOrphan") === "on";
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Thank you — your application is in.",
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!studentName) fieldErrors.studentName = "Student name is required.";
  if (!grade) fieldErrors.grade = "Current grade is required.";
  if (!school) fieldErrors.school = "School name is required.";
  if (!guardianName) fieldErrors.guardianName = "Guardian / parent name is required.";
  if (!address) fieldErrors.address = "Address is required.";
  if (!phone && !email) {
    fieldErrors.phone = "Please provide a phone or email.";
    fieldErrors.email = "Please provide a phone or email.";
  }
  if (email && !isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (message) {
    const e = lengthError("Message", message, 2000);
    if (e) fieldErrors.message = e;
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the errors below.", fieldErrors };
  }

  const ip = await clientIp();
  if (!(await takeRateSlot(ip, { key: RATE_KEY, max: 3, windowMs: 10 * 60 * 1000 }))) {
    return {
      status: "error",
      message: "Too many submissions in a short window. Please wait a few minutes and try again.",
      fieldErrors: {},
    };
  }

  const contactPage = await getContactPage();
  const subject = `[BG-STUDENT-APPLICATION] ${studentName} — Grade ${grade}`;
  const body = [
    `Student: ${studentName}`,
    dateOfBirth ? `Date of birth: ${dateOfBirth}` : null,
    `Grade: ${grade}`,
    `School: ${school}`,
    ethnicity ? `Ethnicity / community: ${ethnicity}` : null,
    isOrphan ? "Orphan: yes" : null,
    "",
    `Guardian: ${guardianName}${guardianRelation ? ` (${guardianRelation})` : ""}`,
    guardianOccupation ? `Guardian occupation: ${guardianOccupation}` : null,
    familyIncome ? `Approx. family income / month: ${familyIncome}` : null,
    "",
    `Address: ${address}`,
    phone ? `Phone: ${phone}` : null,
    email ? `Email: ${email}` : null,
    message ? "" : null,
    message ? "Additional context:" : null,
    message || null,
  ]
    .filter(Boolean)
    .join("\n");

  const ok = await sendEmail({
    to: contactPage.destinationEmail,
    subject,
    text: body,
    replyTo: email || undefined,
  });

  if (!ok) {
    return {
      status: "error",
      message:
        "Something went wrong on our end. Please try again, or email bridginggeneration20@gmail.com directly.",
      fieldErrors: {},
    };
  }

  try {
    await insertStudentRegistration({
      studentName,
      dateOfBirth: dateOfBirth || undefined,
      grade,
      school,
      ethnicity: ethnicity || undefined,
      isOrphan,
      guardianName,
      guardianRelation: guardianRelation || undefined,
      guardianOccupation: guardianOccupation || undefined,
      familyIncome: familyIncome || undefined,
      address,
      phone: phone || undefined,
      email: email || undefined,
      message: message || undefined,
    });
  } catch (err) {
    console.error("[apply/student-sponsorship] DB persist failed (email already sent)", err);
  }

  return {
    status: "success",
    message:
      "Application received. The board reviews student applications at the start of every term. We'll be in touch by phone or email.",
    fieldErrors: {},
    submittedEmail: email || undefined,
  };
}
