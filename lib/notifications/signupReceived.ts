import "server-only";
import { sendEmail } from "@/lib/forms/server";

// Sent when a user finishes signing up. Confirms receipt + sets the
// expectation that they're in the queue.
export async function sendSignupReceivedEmail(args: {
  email: string;
  displayName: string | null;
  roleLabel: string;
}): Promise<void> {
  await sendEmail({
    to: args.email,
    subject: `Your Bridging Generations ${args.roleLabel} application is in`,
    text: [
      `Hi ${args.displayName ?? "there"},`,
      "",
      `Thank you for applying to join Bridging Generations as a ${args.roleLabel}.`,
      "We've received your application — an admin will review it personally and email you",
      "as soon as a decision is made. This usually happens within a few business days.",
      "",
      "Until then, you can close this tab. We'll reach out the moment your account is active.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
}
