"use server";

import { Resend } from "resend";
import { getContactPage } from "@/lib/content/contactPage";
import { clientIp, takeRateSlot } from "@/lib/forms/server";
import type { GiveActionState } from "./actions.types";

const RATE_LIMIT_KEY = "giveForm";
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();

  const fieldErrors: GiveActionState["fieldErrors"] = {};

  if (!name) fieldErrors.name = "Please enter your name.";
  if (!address) fieldErrors.address = "Please enter your address.";
  if (!email) fieldErrors.email = "Please enter an email.";
  else if (!isValidEmail(email)) fieldErrors.email = "Please enter a valid email.";
  if (!phone) fieldErrors.phone = "Please enter your phone number.";
  if (!country) fieldErrors.country = "Please select your country.";

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "Please fix the errors below and try again.", fieldErrors };
  }

  const ip = await clientIp();
  if (
    !(await takeRateSlot(ip, {
      key: RATE_LIMIT_KEY,
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    }))
  ) {
    return {
      status: "error",
      message: "Too many submissions in a short window. Please wait a few minutes and try again.",
      fieldErrors: {},
    };
  }

  const displayName = isAnonymous ? "Anonymous" : name;
  const subject = `[BG-PROFILE] New donor sign-up — ${displayName}`;
  const body = [
    `Name: ${displayName}`,
    `Email: ${email}`,
    `Phone: ${countryCode} ${phone}`,
    `Address: ${address}`,
    `Country: ${country}`,
    `Visibility: ${isAnonymous ? "anonymous" : "public"}`,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";

  if (!apiKey) {
    console.warn("[give] RESEND_API_KEY not set; logged only.");
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
      message: "Something went wrong. Please try again or email info@bridginggenerations.org.",
      fieldErrors: {},
    };
  }

  return { status: "success", message: "Profile submitted — we'll be in touch.", fieldErrors: {} };
}
