import "server-only";
import { sendEmail } from "@/lib/forms/server";

// Send the 6-digit OTP to an admin's email. Subject is plain so spam
// filters don't drop it; body deliberately doesn't include the user-id
// or session-id (admin sees it in /admin-verify anyway).
export async function sendAdminVerifyCodeEmail(args: {
  email: string;
  displayName: string | null;
  code: string;
}): Promise<void> {
  await sendEmail({
    to: args.email,
    subject: "Your Bridging Generations admin sign-in code",
    text: [
      `Hi ${args.displayName ?? "there"},`,
      "",
      "Use this code to finish signing in to the admin dashboard:",
      "",
      `  ${args.code}`,
      "",
      "The code expires in 10 minutes. If you didn't try to sign in,",
      "ignore this email — the code can't be used without your password.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
}
