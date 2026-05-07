"use server";

import { headers } from "next/headers";
import { Resend } from "resend";
import { getContactPage } from "@/lib/content/contactPage";
import type { GiveActionState } from "./actions.types";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

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

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function submitGiveForm(
  _prev: GiveActionState,
  formData: FormData,
): Promise<GiveActionState> {
  const honeypot = String(formData.get("company") ?? "");
  if (honeypot.length > 0) {
    return {
      status: "success",
      message: "Profile submitted — we'll be in touch.",
      fieldErrors: {},
    };
  }

  const isAnonymous = formData.get("visibility") === "anonymous";
  const nameInput = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const messageInput = String(formData.get("message") ?? "").trim();

  const fieldErrors: GiveActionState["fieldErrors"] = {};

  if (!isAnonymous) {
    if (!nameInput) fieldErrors.name = "Please enter your name.";
    else if (nameInput.length > 60) fieldErrors.name = "Name must be 60 characters or less.";
  }
  if (!email) fieldErrors.email = "Please enter an email.";
  else if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (photoUrl && !isValidUrl(photoUrl)) fieldErrors.photoUrl = "Please enter a valid URL.";
  if (messageInput.length > 300) fieldErrors.message = "Message must be 300 characters or less.";

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
      message: "Too many submissions in a short window. Please wait a few minutes and try again.",
      fieldErrors: {},
    };
  }

  const displayName = isAnonymous ? "Anonymous" : nameInput;
  const subject = `[BG-PROFILE] New donor profile — ${displayName}`;
  const body = [
    `Display name: ${displayName}`,
    `Email: ${email}`,
    `Visibility: ${isAnonymous ? "anonymous" : "public"}`,
    photoUrl ? `Photo URL: ${photoUrl}` : null,
    messageInput ? `\nPublic message:\n${messageInput}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";

  if (!apiKey) {
    console.warn("[give] RESEND_API_KEY is not set; profile submission logged but not sent.");
    console.info("[give] %s\n%s", subject, body);
    return {
      status: "success",
      message: "Profile submitted — we'll be in touch.",
      fieldErrors: {},
    };
  }

  try {
    const contactPage = await getContactPage();
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: fromAddress,
      to: contactPage.destinationEmail,
      replyTo: email,
      subject,
      text: body,
    });
  } catch (err) {
    console.error("[give] resend failed", err);
    return {
      status: "error",
      message:
        "Something went wrong on our end. Please try again or email info@bridginggenerations.org.",
      fieldErrors: {},
    };
  }

  return { status: "success", message: "Profile submitted — we'll be in touch.", fieldErrors: {} };
}
