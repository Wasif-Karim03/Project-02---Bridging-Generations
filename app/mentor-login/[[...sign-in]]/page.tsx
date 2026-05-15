import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Mentor sign-in",
  robots: { index: false, follow: false },
};

// Dedicated mentor sign-in URL. Same Clerk underneath as the donor and admin
// sign-ins; differs only in visual framing + post-sign-in redirect to
// /dashboard/mentor. Self-sign-up is hidden — new mentors come through the
// /apply/mentor application form, get approved by an admin, and are then
// promoted from donor → mentor at /dashboard/admin/users.

export default async function MentorSignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>Setup pending</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            Mentor sign-in is being configured.
          </h1>
          <p className="mt-3 text-body text-ink-2">
            Once Clerk auth is wired, mentors will sign in here. In the meantime, if you're
            interested in mentoring a student,{" "}
            <Link
              href="/apply/mentor"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              apply to mentor
            </Link>
            .
          </p>
          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable.
          </p>
        </div>
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Mentor portal</p>
        <h1 className="text-balance text-heading-2 text-ink">Welcome back, mentor.</h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          Sign in to view your assigned students and file this week's report.
        </p>
      </div>

      <SignIn
        path="/mentor-login"
        routing="path"
        forceRedirectUrl="/dashboard/mentor"
        // Send curious "sign up" clickers to the dedicated mentor-signup
        // flow rather than the generic donor sign-up.
        signUpUrl="/mentor-signup"
        appearance={{
          variables: {
            colorPrimary: "#0f4c5c",
          },
        }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Not a mentor yet?{" "}
        <Link
          href="/mentor-signup"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Create a mentor account →
        </Link>
      </p>

      <SignInFooterLinks current="mentor" />
    </main>
  );
}

// Cross-role footer rendered at the bottom of every role-specific sign-in
// page so a user who landed on the wrong portal can hop to the right one.
function SignInFooterLinks({ current }: { current: "donor" | "mentor" | "admin" }) {
  const links: { href: string; label: string; key: "donor" | "mentor" | "admin" }[] = [
    { key: "donor", href: "/sign-in", label: "Donor sign-in" },
    { key: "mentor", href: "/mentor-login", label: "Mentor sign-in" },
    { key: "admin", href: "/admin-login", label: "Admin sign-in" },
  ];
  return (
    <p className="mt-6 text-center text-meta uppercase tracking-[0.06em] text-ink-2">
      Wrong place?{" "}
      {links
        .filter((l) => l.key !== current)
        .map((l, i, arr) => (
          <span key={l.key}>
            <Link
              href={l.href}
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              {l.label}
            </Link>
            {i < arr.length - 1 ? " · " : null}
          </span>
        ))}
    </p>
  );
}
