import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Become a mentor",
  robots: { index: false, follow: false },
};

// Mentor sign-up. Creates the Clerk account (which the webhook mirrors as a
// users row with role=donor by default). After sign-up we send the applicant
// to /mentor-signup/details for the full profile + application form. On submit
// of that form, a mentor_applications row is created and the user lands on
// /pending-approval. An admin reviews and approves from
// /dashboard/admin/applications/mentor/[id], which promotes their role to
// mentor and clears the pending status.

export default async function MentorSignUpPage() {
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode · Mentor" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev ? "Walk through the mentor signup flow." : "Mentor sign-up is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — click below to simulate a fresh mentor sign-up. The real flow renders Clerk's hosted form here."
              : "Once Clerk auth is wired, you'll be able to create a mentor account here."}
          </p>

          {isDev ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/mentor-signup/details"
                className="inline-flex min-h-[48px] items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
              >
                Simulate sign-up → continue to application form
              </Link>
              <Link
                href="/mentor-login"
                className="inline-flex min-h-[44px] items-center justify-center border border-hairline px-5 text-nav-link uppercase text-ink hover:border-accent hover:text-accent"
              >
                Already a mentor? Sign in
              </Link>
            </div>
          ) : null}

          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable real mentor sign-up.
          </p>
        </div>
      </main>
    );
  }

  const { SignUp } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Mentor portal</p>
        <h1 className="text-balance text-heading-2 text-ink">Become a mentor.</h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          Step 1 of 2 — create your account here. On the next page you'll share the details our
          board needs to review your application.
        </p>
      </div>

      <SignUp
        path="/mentor-signup"
        routing="path"
        forceRedirectUrl="/mentor-signup/details"
        signInUrl="/mentor-login"
        appearance={{
          variables: {
            colorPrimary: "#0f4c5c",
          },
        }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Already a mentor?{" "}
        <Link
          href="/mentor-login"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Sign in →
        </Link>
      </p>

      <p className="mt-6 text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Not a mentor?{" "}
        <Link
          href="/sign-up"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Donor sign-up
        </Link>
      </p>
    </main>
  );
}
