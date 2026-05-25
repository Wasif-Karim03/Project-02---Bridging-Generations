"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// Treat the Clerk session as a browser-session: when the tab/window closes
// (or the page is hard-refreshed), sign the user out so the next visit
// requires fresh credentials. The default Clerk session lives ~7 days; this
// makes it last only as long as the tab is open.
//
// `pagehide` is more reliable than `beforeunload` on mobile Safari + iOS
// (where Apple deprecated beforeunload). We register both for breadth.
//
// Limits: doesn't fire on browser crash or force-quit. In those cases the
// session falls back to Clerk's natural lifetime — acceptable since the
// next interaction still requires the cookie to be present.
export function SignOutOnTabClose() {
  const { signOut } = useClerk();

  useEffect(() => {
    const handler = () => {
      // Fire-and-forget. The page is closing; we don't await.
      void signOut();
    };
    window.addEventListener("beforeunload", handler);
    window.addEventListener("pagehide", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      window.removeEventListener("pagehide", handler);
    };
  }, [signOut]);

  return null;
}
