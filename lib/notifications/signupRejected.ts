import "server-only";
import { sendEmail } from "@/lib/forms/server";

// Sent when an admin flips a user's status from 'pending' to 'rejected'.
// Optional reason is appended verbatim if provided — the admin form passes
// it through unaltered so the recipient sees exactly what was written.
export async function sendSignupRejectedEmail(args: {
  email: string;
  displayName: string | null;
  roleLabel: string;
  reason: string | null;
}): Promise<void> {
  const body = [
    `Hi ${args.displayName ?? "there"},`,
    "",
    "Thank you for your interest in joining Bridging Generations as a",
    `${args.roleLabel}. After reviewing your application, the board has decided`,
    "not to move forward at this time. You're welcome to apply again in the future.",
  ];
  if (args.reason) {
    body.push("", "Note from the board:", args.reason);
  }
  body.push(
    "",
    "If you'd like guidance on a future application, reply to this email or",
    "reach out via brigen.org/contact.",
    "",
    "— Bridging Generations",
  );

  await sendEmail({
    to: args.email,
    subject: "About your Bridging Generations application",
    text: body.join("\n"),
  });
}
