import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Join as Media",
  robots: { index: false, follow: false },
};

export default async function MediaSignUpPage() {
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode · Media" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            {isDev ? "Walk through the media signup flow." : "Media sign-up is being configured."}
          </h1>
          <p className="mt-3 text-body text-ink-2">
            {isDev
              ? "Clerk isn't wired locally — the real flow renders Clerk's hosted form here, then routes to /media-signup/details."
              : "Once Clerk auth is wired, you'll be able to create a media account here."}
          </p>
          {isDev ? (
            <Link
              href="/media-signup/details"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
            >
              Simulate sign-up → continue to details
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  const { SignUp } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Media portal</p>
        <h1 className="text-balance text-heading-2 text-ink">Join the media team.</h1>
        <p className="max-w-[44ch] text-body text-ink-2">
          Create your account here. The next step asks for a few role-specific details, then an
          admin reviews and unlocks media features.
        </p>
      </div>

      <SignUp
        path="/media-signup"
        routing="path"
        forceRedirectUrl="/media-signup/details"
        signInUrl="/media-login"
        appearance={{ variables: { colorPrimary: "#0f4c5c" } }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        Already have an account?{" "}
        <Link
          href="/media-login"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Sign in →
        </Link>
      </p>
    </main>
  );
}
