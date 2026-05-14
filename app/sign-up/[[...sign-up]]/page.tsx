import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[480px] border border-hairline bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Setup pending</p>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            Sign-up is being configured.
          </h1>
          <p className="mt-3 text-body text-ink-2">
            Donor and mentor accounts go live once Clerk auth is wired. In the meantime, support the
            org via{" "}
            <Link
              href="/donate"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /donate
            </Link>{" "}
            or send a note via{" "}
            <Link
              href="/contact"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /contact
            </Link>
            .
          </p>
          <div className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Vercel env to enable.
          </div>
        </div>
      </main>
    );
  }
  const { SignUp } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
    </main>
  );
}
