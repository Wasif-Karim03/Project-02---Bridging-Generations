"use server";

import { getContactPage } from "@/lib/content/contactPage";
import { insertMentorApplication } from "@/lib/db/queries/applications";
import { type FormActionState, isValidEmail, lengthError } from "@/lib/forms";
import { clientIp, sendEmail, takeRateSlot } from "@/lib/forms/server";

const RATE_KEY = "mentorApplication";

export async function submitMentorApplication(
  _prev: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const occupation = String(formData.get("occupation") ?? "").trim();
  const educationStatus = String(formData.get("educationStatus") ?? "").trim();
  const subjects = String(formData.get("subjects") ?? "").trim();
  const hoursPerWeek = String(formData.get("hoursPerWeek") ?? "").trim();
  const startTerm = String(formData.get("startTerm") ?? "").trim();
  const whyMentor = String(formData.get("whyMentor") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Thank you — your application is in.",
      fieldErrors: {},
    };
  }

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = "Your name is required.";
  if (!email) fieldErrors.email = "Email is required.";
  else if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (!subjects) fieldErrors.subjects = "Subjects / expertise is required.";
  if (!whyMentor) fieldErrors.whyMentor = "Please share why you want to mentor.";
  else {
    const e = lengthError("Statement", whyMentor, 2000);
    if (e) fieldErrors.whyMentor = e;
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
  const subject = `[BG-MENTOR] ${name} — ${subjects.slice(0, 60)}`;
  const body = [
    `Applicant: ${name}`,
    `Email: ${email}`,
    country ? `Country: ${country}` : null,
    occupation ? `Occupation: ${occupation}` : null,
    educationStatus ? `Education: ${educationStatus}` : null,
    `Subjects / expertise: ${subjects}`,
    hoursPerWeek ? `Hours per week: ${hoursPerWeek}` : null,
    startTerm ? `Available from: ${startTerm}` : null,
    "",
    "Why mentor:",
    whyMentor,
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

  try {
    await insertMentorApplication({
      name,
      email,
      country: country || undefined,
      occupation: occupation || undefined,
      educationStatus: educationStatus || undefined,
      subjects,
      hoursPerWeek: hoursPerWeek || undefined,
      startTerm: startTerm || undefined,
      whyMentor,
    });
  } catch (err) {
    console.error("[apply/mentor] DB persist failed (email already sent)", err);
  }

  return {
    status: "success",
    message:
      "Application received. The board reviews mentor applications within three weeks — we'll be in touch by email.",
    fieldErrors: {},
    submittedEmail: email,
  };
}
