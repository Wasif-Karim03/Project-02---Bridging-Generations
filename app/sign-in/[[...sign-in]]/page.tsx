import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Donor sign-in",
  robots: { index: false, follow: false },
};

// Donor sign-in. Same Clerk underneath as the mentor + admin sign-ins;
// differs only in visual framing, post-sign-in redirect to /dashboard/donor,
// and that this is the only one with self-service sign-up enabled —
// anyone can register as a donor and donate.

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const justSignedUp = welcome === "1";
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border border-hairline bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev
              ? justSignedUp
                ? "Account created. Continue to your donor dashboard."
                : "Sign in to view your donor dashboard."
              : "Sign-in is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — click below to simulate sign-in and land on the donor dashboard. The real flow renders Clerk's hosted form here."
              : "Donor accounts go live once Clerk auth is wired into this site."}
          </p>

          {isDev ? (
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/dashboard/donor"
                className="inline-flex min-h-[48px] items-center justify-center bg-accent-2-text px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover"
              >
                Continue to donor dashboard →
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

          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env (or
            .env.local for local dev) to enable real sign-in.
          </p>
        </div>
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex max-w-[520px] flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Donor portal</p>
        <h1 className="text-balance text-heading-2 text-ink">
          {justSignedUp ? "Account created. Sign in to continue." : "Welcome back."}
        </h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          {justSignedUp
            ? "Your donor account is ready. Sign in with the credentials you just set to view your dashboard."
            : "Sign in to see your donation history, manage receipts, and view the students you support."}
        </p>
      </div>

      <SignIn
        path="/sign-in"
        routing="path"
        forceRedirectUrl="/dashboard/donor"
        signUpUrl="/sign-up"
        appearance={{
          variables: {
            colorPrimary: "#0f4c5c",
          },
        }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        First time here?{" "}
        <Link
          href="/sign-up"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Create a donor account →
        </Link>
      </p>

      <SignInFooterLinks current="donor" />
    </main>
  );
}

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
