import type { Metadata } from "next";
import { Link } from "next-view-transitions";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { isClerkConfigured } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Accountant sign-in",
  robots: { index: false, follow: false },
};

export default async function AccountantLoginPage() {
  if (!isClerkConfigured()) {
    const isDev = process.env.NODE_ENV === "development";
    return (
      <main className="flex min-h-screen items-center justify-center bg-ground px-4 py-16">
        <div className="mx-auto max-w-[520px] border-2 border-accent bg-ground-2 p-8 shadow-[var(--shadow-card)]">
          <Eyebrow>{isDev ? "Preview mode · Accountant sign-in" : "Setup pending"}</Eyebrow>
          <h1 className="mt-3 text-balance text-heading-3 text-ink">
            Accountant sign-in is being configured.
          </h1>
          {isDev ? (
            <Link
              href="/dashboard/accountant"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
            >
              Simulate sign-in →
            </Link>
          ) : null}
        </div>
      </main>
    );
  }

  const { SignIn } = await import("@clerk/nextjs");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ground px-4 py-16">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <p className="text-eyebrow uppercase tracking-[0.12em] text-accent">Accountant portal</p>
        <h1 className="text-balance text-heading-2 text-ink">Sign in as accountant.</h1>
      </div>

      <SignIn
        path="/accountant-login"
        routing="path"
        forceRedirectUrl="/dashboard/accountant"
        signUpUrl="/accountant-signup"
        appearance={{ variables: { colorPrimary: "#0f4c5c" } }}
      />

      <p className="mt-8 max-w-[44ch] text-center text-meta uppercase tracking-[0.06em] text-ink-2">
        New here?{" "}
        <Link
          href="/accountant-signup"
          className="text-accent underline underline-offset-[3px] hover:no-underline"
        >
          Create an accountant account →
        </Link>
      </p>
    </main>
  );
}
