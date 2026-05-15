import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Apply as a student",
  description: "Create your student account and submit your scholarship application.",
  robots: { index: false, follow: false },
};

// Student sign-up. Creates the Clerk account; afterward Clerk redirects to
// /student-signup/details where the student fills out their scholarship
// application. The application is reviewed by an admin who, on approval,
// links the account to a Keystatic student record. The same account works
// for both new applicants and currently-enrolled students.

export default async function StudentSignUpPage() {
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode · Student" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev
              ? "Walk through the student signup flow."
              : "Student sign-up is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — click below to simulate a fresh student sign-up and land on the application form."
              : "Once Clerk is wired, you'll create your account here and then complete your scholarship application."}
          </p>

          {isDev ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/student-signup/details"
                className="inline-flex min-h-[48px] items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
              >
                Simulate signup → continue to application
              </Link>
              <Link
                href="/student-login"
                className="inline-flex min-h-[44px] items-center justify-center border border-hairline px-5 text-nav-link uppercase text-ink hover:border-accent hover:text-accent"
              >
                Already have an account? Sign in
              </Link>
            </div>
          ) : null}

          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable real sign-up.
          </p>
        </div>
      </main>
    );
  }

  const { SignUp } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Student portal</p>
        <h1 className="text-balance text-heading-2 text-ink">Apply as a student.</h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          Create your account first — then you'll share the details we need to review your
          application.
        </p>
      </div>

      <SignUp
        path="/student-signup"
        routing="path"
        forceRedirectUrl="/student-signup/details"
        signInUrl="/student-login"
        appearance={{ variables: { colorPrimary: "#0f4c5c" } }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Already have an account?{" "}
        <Link
          href="/student-login"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Sign in →
        </Link>
      </p>
    </main>
  );
}
