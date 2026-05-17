"use server";

import { revalidatePath } from "next/cache";
import { getCurrentDbUser, requireRole } from "@/lib/auth";
import {
  getLatestStudentRegistrationForUser,
  setLatestStudentRegistrationStatus,
} from "@/lib/db/queries/applications";
import { getUserById, setUserStudentSlug } from "@/lib/db/queries/users";
import { sendEmail } from "@/lib/forms/server";
import { sendStudentRejectionEmail } from "@/lib/notifications/studentRejection";
import { studentCodeForUuid } from "@/lib/student/studentCode";

export async function adminLinkStudentSlugAction(
  userId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  const slug = String(formData.get("studentSlug") ?? "")
    .trim()
    .slice(0, 80);
  try {
    // Capture the previous state so we only fire the approval email when
    // this is a fresh link (transition from unlinked → linked), not on
    // every save of an already-linked student.
    const prev = await getUserById(userId);
    const wasLinked = Boolean(prev?.studentSlug);
    await setUserStudentSlug(userId, slug || null);
    revalidatePath("/dashboard/admin/students");
    revalidatePath(`/dashboard/student`);

    if (slug && !wasLinked && prev?.email) {
      // Send the approval email only on first-time link. Failures don't
      // roll back the link itself.
      const studentCode = studentCodeForUuid(prev.id);
      await sendEmail({
        to: prev.email,
        subject: "You're approved — welcome to Bridging Generations",
        text: [
          `Hi ${prev.displayName ?? "there"},`,
          "",
          "Great news — the board has approved your scholarship application. Your account is",
          "now linked to your public student profile, so when you sign in you'll see your",
          "sponsors and the donations they've made toward your education.",
          "",
          `Your Student ID: ${studentCode}`,
          "",
          "You can sign in with your email, your phone number, or this Student ID — plus the",
          "password you set when you created the account. Keep the ID somewhere safe; it's also",
          "shown on your dashboard.",
          "",
          "Sign in to your dashboard:",
          "https://brigen.org/student-login",
          "",
          "Your public profile (visible to potential sponsors):",
          `https://brigen.org/students/${slug}`,
          "",
          "Welcome — we're glad to have you with us.",
          "",
          "— Bridging Generations",
        ].join("\n"),
      });
    }
    return { ok: true };
  } catch (err) {
    console.error("[admin/students/link] failed", err);
    return { ok: false, error: "Could not update the link." };
  }
}

// Reject a pending student application. Sets the registration status to
// "rejected", records who/when/why on the registration row, and sends a
// soft-language rejection email. Does NOT change the user's role — they
// keep their account and can use the site as a donor.
export async function adminRejectStudentAction(
  userId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireRole("admin");
  if (!userId) return { ok: false, error: "Invalid student id." };
  const reason = String(formData.get("reason") ?? "")
    .trim()
    .slice(0, 1000);
  try {
    const [target, reviewer, registration] = await Promise.all([
      getUserById(userId),
      getCurrentDbUser(),
      getLatestStudentRegistrationForUser(userId),
    ]);
    if (!target?.email) return { ok: false, error: "Student has no email on file." };
    if (!reviewer) return { ok: false, error: "Reviewer lookup failed." };
    if (!registration) {
      return { ok: false, error: "This student hasn't submitted an application yet." };
    }
    if (registration.status === "rejected") {
      return { ok: false, error: "This application is already marked rejected." };
    }
    // Make sure they're not currently linked — if they are, the admin should
    // unlink first via the slug dropdown. Rejecting a linked student would
    // leave the dashboard in an inconsistent state.
    if (target.studentSlug) {
      return {
        ok: false,
        error: "Unlink the student from their Keystatic record before rejecting.",
      };
    }

    await setLatestStudentRegistrationStatus({
      applicantUserId: userId,
      status: "rejected",
      reviewedBy: reviewer.id,
      notes: reason || null,
    });
    await sendStudentRejectionEmail({
      email: target.email,
      studentName: registration.studentName,
      reason: reason || null,
    });

    revalidatePath("/dashboard/admin/students");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/student");
    return { ok: true };
  } catch (err) {
    console.error("[admin/students/reject] failed", err);
    return { ok: false, error: "Could not save the decision. Please try again." };
  }
}
