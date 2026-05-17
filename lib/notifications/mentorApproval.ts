import "server-only";
import { sendEmail } from "@/lib/forms/server";

// "Welcome to mentoring" email. Sent when an admin flips a user's role to
// `mentor` for the first time, regardless of which admin screen they used
// (/dashboard/admin/users or the donor-detail page). Centralizes the
// template so both callers stay consistent.

type MentorApprovalArgs = {
  email: string;
  displayName: string | null;
};

export async function sendMentorApprovalEmail({
  email,
  displayName,
}: MentorApprovalArgs): Promise<void> {
  await sendEmail({
    to: email,
    subject: "You're approved to mentor with Bridging Generations",
    text: [
      `Hi ${displayName ?? "there"},`,
      "",
      "Good news — the board has approved you as a mentor with Bridging Generations.",
      "Your account is now set up to receive student assignments and file weekly reports.",
      "",
      "Sign in any time at your dedicated mentor portal:",
      "https://brigen.org/mentor-login",
      "",
      "When you sign in you'll see:",
      "  • The students you've been paired with (admin assigns these from /dashboard/admin/mentors)",
      "  • A weekly report form for each — attendance, study notes, action items",
      "  • Optional file attachments for homework or progress photos",
      "",
      "We expect a short weekly check-in for each student you mentor. Quality > length —",
      "even a few sentences a week makes a real difference.",
      "",
      "Welcome to the team — we're glad to have you.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
}
