import "server-only";
import { sendEmail } from "@/lib/forms/server";

// "Your scholarship application wasn't approved" email. Soft language by
// design — many of our applicants are minors, and rejection from a
// scholarship can feel personal. We thank them, name the decision clearly,
// share the reason if the admin provided one, and leave the door open for
// future applications.

type StudentRejectionArgs = {
  email: string;
  studentName: string | null;
  reason: string | null;
};

export async function sendStudentRejectionEmail({
  email,
  studentName,
  reason,
}: StudentRejectionArgs): Promise<void> {
  const greeting = studentName ? `Hi ${studentName},` : "Hi,";
  const reasonBlock = reason ? ["The board's note:", "", `    ${reason}`, ""] : [];

  await sendEmail({
    to: email,
    subject: "An update on your Bridging Generations application",
    text: [
      greeting,
      "",
      "Thank you for applying to a Bridging Generations scholarship and for sharing your",
      "story with us. After careful review, the board has decided not to move forward with",
      "your application at this time.",
      "",
      ...reasonBlock,
      "We know this is disappointing news. Please know that this isn't a judgement of your",
      "potential — we have limited funded slots each term and far more deserving applicants",
      "than we can support. The decision is about fit and capacity for this cycle.",
      "",
      "You're welcome to apply again in the future. If your circumstances change or you'd",
      "like guidance on strengthening a future application, write back to us — we'll do our",
      "best to help.",
      "",
      "Your account remains active, and you can keep using the site as a donor account",
      "if you'd like to support other students in your community:",
      "https://brigen.org/sign-in",
      "",
      "Wishing you the very best.",
      "",
      "— Bridging Generations",
    ].join("\n"),
  });
}
