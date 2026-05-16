"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getUserById, setUserStudentSlug } from "@/lib/db/queries/users";
import { sendEmail } from "@/lib/forms/server";
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
