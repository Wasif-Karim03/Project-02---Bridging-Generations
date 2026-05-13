"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { getContactPage } from "@/lib/content/contactPage";
import {
  AUDIENCE_VALUES,
  type AudienceValue,
  type ContactActionState,
  SUBJECT_PREFIX,
} from "./actions.types";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function parseAudience(raw: string): AudienceValue | undefined {
  return (AUDIENCE_VALUES as readonly string[]).includes(raw) ? (raw as AudienceValue) : undefined;
}

type Bucket = { count: number; resetAt: number };
const rateBucket = new Map<string, Bucket>();

function takeRateSlot(ip: string): boolean {
  const now = Date.now();
  const existing = rateBucket.get(ip);
  if (!existing || existing.resetAt <= now) {
    rateBucket.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitContactForm(
  _prev: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const audienceRaw = String(formData.get("audience") ?? "").trim();
  const audience = parseAudience(audienceRaw);
  const isSubscribe = audience === "subscriber";

  const nameInput = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const messageInput = String(formData.get("message") ?? "").trim();
  const honeypot = String(formData.get("company") ?? "");

  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Thank you — your message is on its way.",
      fieldErrors: {},
    };
  }

  // Subscribe path synthesizes name/message so the donor needs to give only an email.
  const name = isSubscribe ? nameInput || "Newsletter subscriber" : nameInput;
  const message = isSubscribe
    ? messageInput || "Subscribed via /donate/thank-you quarterly-update form."
    : messageInput;

  const fieldErrors: ContactActionState["fieldErrors"] = {};
  if (!isSubscribe) {
    if (!name) fieldErrors.name = "Please tell us your name.";
    else if (name.length > 100) fieldErrors.name = "Name must be 100 characters or less.";
  }
  if (!email) fieldErrors.email = "Please enter an email.";
  else if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (!isSubscribe) {
    if (!message) fieldErrors.message = "Please include a message.";
    else if (message.length > 2000)
      fieldErrors.message = "Message must be 2000 characters or less.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the errors below and try again.",
      fieldErrors,
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown";

  if (!takeRateSlot(ip)) {
    return {
      status: "error",
      message: "Too many messages in a short window. Please wait a few minutes and try again.",
      fieldErrors: {},
    };
  }

  const contactPage = await getContactPage();
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";

  const subjectPrefix = audience ? `${SUBJECT_PREFIX[audience]} ` : "";
  const subject = `${subjectPrefix}Contact form — ${name}`;
  const audienceLine = audience ? `Audience: ${audience}\n` : "";
  const body = `${audienceLine}From: ${name} <${email}>\n\n${message}`;
  const successMessage = isSubscribe
    ? "Thanks — you're on the quarterly-update list. The board will follow up within two business days."
    : "Thanks — your message is in. We reply within two business days.";

  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set; form submission logged but not sent.");
    console.info("[contact] %s → %s\n%s", subject, contactPage.destinationEmail, body);
    return {
      status: "success",
      message: successMessage,
      fieldErrors: {},
      submittedEmail: email,
    };
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromAddress,
      to: contactPage.destinationEmail,
      replyTo: email,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("[contact] resend failed", err);
    return {
      status: "error",
      message:
        "Something went wrong on our end. Please try again, or email info@bridginggenerations.org directly.",
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message: successMessage,
    fieldErrors: {},
    submittedEmail: email,
  };
}
