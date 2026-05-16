"use client";

import { Link } from "next-view-transitions";
import { useEffect } from "react";

// Per-route error boundary. Catches any runtime error in a server / client
// component inside the (app) or (site) route groups and renders a friendly
// fallback in the existing chrome (Nav + Footer remain). For errors that
// blow up the root layout itself, see app/global-error.tsx.

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error to the dev console + (eventually) Sentry. The
    // `digest` Next adds is the stable id we can match to server logs.
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/error] caught:", error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-[720px] flex-col items-start gap-6 px-4 py-16 sm:px-6 lg:px-[6%] lg:py-24">
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Something went wrong</p>
      <h1 className="text-balance text-display-3 text-ink">
        We hit an unexpected error on this page.
      </h1>
      <p className="max-w-[60ch] text-body text-ink-2">
        It's been logged on our side. You can retry the action, or head back to the homepage.
      </p>
      {error.digest ? (
        <p className="font-mono text-meta uppercase tracking-[0.06em] text-ink-2">
          Error ref · {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
