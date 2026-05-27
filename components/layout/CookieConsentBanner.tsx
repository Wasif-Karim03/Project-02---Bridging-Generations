"use client";

import { Link } from "next-view-transitions";
import { useEffect, useState } from "react";

const STORAGE_KEY = "bg-cookie-consent-v1";

// Slim privacy banner — strictly-necessary cookies only (auth, locale,
// CSRF). We don't run third-party analytics yet, so this is informational
// rather than an opt-in gate. When/if analytics ships, flip the
// "Accept all" button to actually set a consent cookie that the analytics
// loader checks.
export function CookieConsentBanner() {
  // SSR-safe pattern: render nothing until hydration finishes so we don't
  // flash a banner the user already dismissed.
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setHydrated(true);
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // localStorage can throw in private-mode contexts; fail open (show banner).
      setDismissed(false);
    }
  }, []);

  function onAccept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore — user closed the banner once, that's enough for the session.
    }
    setDismissed(true);
  }

  if (!hydrated || dismissed) return null;
  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-hairline bg-ground-2 px-4 py-4 shadow-[var(--shadow-card)] sm:px-6"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[64ch] text-body-sm text-ink-2">
          We use only strictly-necessary cookies — sign-in, language preference, and CSRF tokens. No
          third-party trackers. See{" "}
          <Link
            href="/privacy"
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            Privacy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="inline-flex min-h-[40px] items-center bg-accent px-5 text-nav-link uppercase text-white transition-colors hover:bg-accent/90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
