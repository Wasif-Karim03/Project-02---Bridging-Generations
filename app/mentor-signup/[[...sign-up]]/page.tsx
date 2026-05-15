import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Become a mentor",
  robots: { index: false, follow: false },
};

// Mentor sign-up. Creates the Clerk account (which the webhook mirrors as a
// users row with role=donor by default). After sign-up the user lands on
// /dashboard/donor with a "?welcome=mentor" flag — the dashboard surfaces a
// "your mentor application is under review" banner. An admin promotes them
// from donor → mentor at /dashboard/admin/users once they've been vetted.

export default async function MentorSignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>Setup pending</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            Mentor sign-up is being configured.
          </h1>
          <p className="mt-3 text-body text-ink-2">
            Once Clerk auth is wired, you'll be able to create a mentor account here.
          </p>
          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable.
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
          Create your account here. After sign-up, our team reviews your application and unlocks
          mentor features within a few days.
        </p>
      </div>

      <SignUp
        path="/mentor-signup"
        routing="path"
        forceRedirectUrl="/dashboard/donor?welcome=mentor"
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
