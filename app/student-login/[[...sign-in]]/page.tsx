import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Student sign-in",
  robots: { index: false, follow: false },
};

// Dedicated student sign-in URL. Same Clerk as the other portals; lands the
// student on /dashboard/student after auth. Self-sign-up still flows through
// /student-signup (not the generic donor /sign-up) because the application
// form lives on the student track.

export default async function StudentSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const justApplied = welcome === "1";

  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode · Student" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev
              ? justApplied
                ? "Application submitted. Continue to your dashboard."
                : "Sign in to your student dashboard."
              : "Student sign-in is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — click below to land on the student dashboard as a preview student."
              : "Once Clerk auth is wired, students will sign in here."}
          </p>

          {isDev ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard/student"
                className="inline-flex min-h-[48px] items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
              >
                Continue to student dashboard →
              </Link>
              <Link
                href="/student-signup"
                className="inline-flex min-h-[44px] items-center justify-center border border-hairline px-5 text-nav-link uppercase text-ink hover:border-accent hover:text-accent"
              >
                New here? Apply
              </Link>
            </div>
          ) : null}

          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable real sign-in.
          </p>
        </div>
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex max-w-[520px] flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Student portal</p>
        <h1 className="text-balance text-heading-2 text-ink">
          {justApplied ? "Application submitted. Sign in to track its status." : "Welcome back."}
        </h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          {justApplied
            ? "Sign in to see your application status. Once an admin approves and links your account, you'll also see your sponsors and donations."
            : "Sign in to see your application status, your sponsors, and the donations they've made toward your education."}
        </p>
      </div>

      <SignIn
        path="/student-login"
        routing="path"
        forceRedirectUrl="/dashboard/student"
        signUpUrl="/student-signup"
        appearance={{ variables: { colorPrimary: "#0f4c5c" } }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        New here?{" "}
        <Link
          href="/student-signup"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Apply for a scholarship →
        </Link>
      </p>
    </main>
  );
}
