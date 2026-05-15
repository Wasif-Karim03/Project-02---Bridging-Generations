import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getCurrentDbUser, requireUserId } from "@/lib/auth";
import { StudentApplicationForm } from "./_components/StudentApplicationForm";

export const metadata: Metadata = {
  title: "Scholarship application",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// Step 2 of the student signup flow. The Clerk account was created on
// /student-signup; here the student fills in the details we need to evaluate
// their application. On submit, we persist to student_registrations,
// promote their users.role to "student", and redirect them to sign-in.

export default async function StudentApplicationPage() {
  await requireUserId();
  const dbUser = await getCurrentDbUser();
  const initialEmail = dbUser?.email ?? undefined;

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-12 sm:px-6 lg:px-[6%] lg:py-16">
      <header className="mb-8 flex flex-col gap-3">
        <Eyebrow>Step 2 of 2 · Your details</Eyebrow>
        <h1 className="text-balance text-display-3 text-ink">
          Share the details we need to review your application.
        </h1>
        <p className="max-w-[64ch] text-body text-ink-2">
          Everything here goes only to our board for review. Once an admin approves you and links
          your account, you'll be able to see your sponsors and the donations they've made on the{" "}
          <Link
            href="/dashboard/student"
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            student dashboard
          </Link>
          .
        </p>
      </header>

      <StudentApplicationForm initialEmail={initialEmail} />
    </main>
  );
}
