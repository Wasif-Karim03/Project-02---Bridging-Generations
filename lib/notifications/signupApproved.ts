import "server-only";
import { sendEmail } from "@/lib/forms/server";

// Sent when an admin flips a user's status from 'pending' to 'active'.
// One template across all roles — the loginUrl differs and the role
// label is interpolated.
export async function sendSignupApprovedEmail(args: {
  email: string;
  displayName: string | null;
  roleLabel: string;
  loginUrl: string;
}): Promise<void> {
  await sendEmail({
    to: args.email,
    subject: `You're approved — sign in to Bridging Generations`,
    text: [
      `Hi ${args.displayName ?? "there"},`,
      "",
      `Good news — the board has approved your ${args.roleLabel} application.`,
      "Your account is now active and you can sign in any time at the link below.",
      "",
      `Sign in: ${args.loginUrl}`,
      "",
      "If you'd set up a password during signup, use that. If you signed up with a social",
      "provider (Google, etc.), use the same one. Email questions to this address any time.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
}
