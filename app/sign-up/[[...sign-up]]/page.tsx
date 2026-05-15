import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign up",
  robots: { index: false, follow: false },
};

export default async function SignUpPage() {
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border border-hairline bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev ? "Walk through the donor flow." : "Sign-up is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — click below to simulate a fresh sign-up and land on the sign-in page (the real flow goes through Clerk's hosted form here). All dashboard surfaces are demoable in preview mode."
              : "Donor and mentor accounts go live once Clerk auth is wired. In the meantime, support the org via /donate or send a note via /contact."}
          </p>

          {isDev ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/sign-in?welcome=1"
                className="inline-flex min-h-[48px] items-center justify-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
              >
                Simulate sign-up → continue to sign-in
              </Link>
              <Link
                href="/be-a-donor"
                className="inline-flex min-h-[44px] items-center justify-center border border-hairline px-5 text-nav-link uppercase text-ink hover:border-accent hover:text-accent"
              >
                ← Back
              </Link>
            </div>
          ) : (
            <ul className="mt-4 flex flex-col gap-2 text-body-sm text-ink-2">
              <li>
                •{" "}
                <Link
                  href="/donate"
                  className="text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  Donate
                </Link>
              </li>
              <li>
                •{" "}
                <Link
                  href="/contact"
                  className="text-accent underline underline-offset-[3px] hover:no-underline"
                >
                  Contact
                </Link>
              </li>
            </ul>
          )}

          <div className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable real sign-up.
          </div>
        </div>
      </main>
    );
  }
  const { SignUp } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-ground px-4 py-16">
      <SignUp signInUrl="/sign-in" forceRedirectUrl="/sign-in?welcome=1" />
    </main>
  );
}
