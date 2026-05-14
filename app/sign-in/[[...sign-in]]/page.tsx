import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

// Renders Clerk's hosted SignIn when configured, or a polite "setup pending"
// panel when Clerk env vars are missing. Both branches keep the public site's
// shell so the brand stays consistent.
export default async function SignInPage() {
  if (!isClerkConfigured()) {
    return <SetupPendingPanel kind="sign-in" />;
  }
  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
      <SignIn signUpUrl="/sign-up" forceRedirectUrl="/dashboard" />
    </main>
  );
}

function SetupPendingPanel({ kind }: { kind: "sign-in" | "sign-up" }) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
      <div className="mx-auto max-w-[480px] border border-hairline bg-ground-2 p-8 shadow-[var(--shadow-card)]">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Setup pending</p>
        <h1 className="mt-3 text-balance text-heading-3 text-ink">
          {kind === "sign-in" ? "Sign-in is being configured." : "Sign-up is being configured."}
        </h1>
        <p className="mt-3 text-body text-ink-2">
          Donor accounts, mentor logins, and the admin dashboard go live once Clerk auth is wired
          into this site. In the meantime, the public site is fully functional —
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-body-sm text-ink-2">
          <li>
            • Donations:{" "}
            <Link
              href="/donate"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /donate
            </Link>
          </li>
          <li>
            • Scholarship application:{" "}
            <Link
              href="/apply/scholarship"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /apply/scholarship
            </Link>
          </li>
          <li>
            • Mentor application:{" "}
            <Link
              href="/apply/mentor"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /apply/mentor
            </Link>
          </li>
          <li>
            • Contact:{" "}
            <Link
              href="/contact"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /contact
            </Link>
          </li>
        </ul>
        <div className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
          Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Vercel env to enable.
        </div>
      </div>
    </main>
  );
}
