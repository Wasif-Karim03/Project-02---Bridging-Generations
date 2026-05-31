import "server-only";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { getApplicationById } from "@/lib/db/queries/applications";
import { sendEmail } from "@/lib/forms/server";

// Emails the applicant when an admin makes a decision on their application
// (approved / rejected). Best-effort: a delivery failure (e.g. Resend's free
// tier only delivering to the account address) is swallowed and never blocks
// the admin action. Fires for any application kind.
export async function notifyApplicantOfDecision(
  kind: ApplicationRow["kind"],
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  if (status !== "approved" && status !== "rejected") return;
  try {
    const detail = await getApplicationById(kind, id);
    if (!detail) return;

    let to: string | undefined;
    let name: string;
    if (detail.kind === "scholarship") {
      to = detail.data.email;
      name = detail.data.applicantName;
    } else if (detail.kind === "mentor") {
      to = detail.data.email;
      name = detail.data.name;
    } else {
      to = detail.data.email ?? undefined;
      name = detail.data.studentName;
    }
    if (!to) return;

    const approved = status === "approved";
    await sendEmail({
      to,
      subject: approved
        ? "Your Bridging Generations application is approved 🎉"
        : "An update on your Bridging Generations application",
      text: [
        `Hi ${name},`,
        "",
        approved
          ? "Great news — the board has approved your application! Sign in to your dashboard to see your status; we'll follow up with the next steps."
          : "Thank you for applying. After careful review, the board has decided not to move forward at this time. You're warmly welcome to apply again in a future cycle.",
        "",
        "Sign in: https://brigen.org/student-login",
        "",
        "If you have any questions, just reply to this email.",
        "",
        "— Bridging Generations",
      ].join("\n"),
    });
  } catch (err) {
    console.error("[notifications] application decision email failed", err);
  }
}
