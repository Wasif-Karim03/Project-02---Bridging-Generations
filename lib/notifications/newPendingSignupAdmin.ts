import "server-only";
import { sendEmail } from "@/lib/forms/server";

// Notify the org email (admins) that a new signup is in the queue. Single
// "to" address — RESEND_FROM_EMAIL by default. If you want multiple admins
// notified, set up a Resend distribution list and point the env at it.
export async function sendNewPendingSignupAdminEmail(args: {
  applicantEmail: string;
  applicantName: string | null;
  roleLabel: string;
}): Promise<void> {
  const orgEmail = process.env.RESEND_FROM_EMAIL ?? "contact@bridginggenerations.org";
  await sendEmail({
    to: orgEmail,
    subject: `New ${args.roleLabel} signup pending review`,
    text: [
      `A new ${args.roleLabel} signup is waiting for review.`,
      "",
      `Name: ${args.applicantName ?? "(not provided)"}`,
      `Email: ${args.applicantEmail}`,
      "",
      "Review at: https://brigen.org/dashboard/admin/pending",
    ].join("\n"),
  });
}
