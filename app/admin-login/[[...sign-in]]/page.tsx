import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

// Dedicated admin sign-in URL. Uses Clerk's <SignIn> underneath (same
// security as /sign-in) but with admin-themed framing so staff don't end
// up on the donor sign-in by mistake, and donors don't discover this URL.
// Self-service sign-up is disabled here — new admins are created by an
// existing admin promoting a donor account, not by self-registering.

export default async function AdminSignInPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-16">
        <div className="mx-auto max-w-[520px] border border-hairline bg-ground p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>Setup pending</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            Admin sign-in is being configured.
          </h1>
          <p className="mt-3 text-body text-ink-2">
            Once Clerk auth is wired, this page becomes the dedicated staff sign-in. Until then,
            visit{" "}
            <Link
              href="/dashboard/admin"
              className="text-accent underline underline-offset-[3px] hover:no-underline"
            >
              /dashboard/admin
            </Link>{" "}
            directly — preview mode bypasses the role check.
          </p>
          <p className="mt-6 border-t border-hairline pt-4 text-meta uppercase tracking-[0.06em] text-ink-2">
            Owner: set CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in Netlify env to
            enable.
          </p>
        </div>
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent-3">
          Staff portal · Restricted
        </p>
        <h1 className="text-balance text-heading-2 text-white">Admin sign-in</h1>
        <p className="max-w-[44ch] text-body text-white/70">
          For Bridging Generations staff and board members. If you're a donor or mentor, use the{" "}
          <Link
            href="/sign-in"
            className="text-accent-3 underline underline-offset-[3px] hover:no-underline"
          >
            regular sign-in
          </Link>{" "}
          instead.
        </p>
      </div>

      <SignIn
        path="/admin-login"
        routing="path"
        forceRedirectUrl="/dashboard/admin"
        signUpUrl="/contact?audience=partner"
        appearance={{
          elements: {
            // Hide self-sign-up affordances — admins are created by promoting
            // an existing donor via /dashboard/admin/users.
            footerActionLink: { display: "none" },
            footerAction: { display: "none" },
          },
          variables: {
            colorPrimary: "#0f4c5c",
          },
        }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-white/50">
        Admin accounts are issued by an existing admin from /dashboard/admin/users — not via
        self-registration.
      </p>
    </main>
  );
}
