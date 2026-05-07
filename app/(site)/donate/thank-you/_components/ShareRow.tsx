"use client";

import { useState } from "react";

const SHARE_URL = "https://bridginggenerations.org/donate";
const SHARE_MESSAGE =
  "I'm sponsoring a student in the Chittagong Hill Tracts via Bridging Generations: https://bridginggenerations.org/donate";

type ShareStatus = "idle" | "shared" | "copied" | "error";

export function ShareRow() {
  const [status, setStatus] = useState<ShareStatus>("idle");

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: "Bridging Generations",
          text: SHARE_MESSAGE,
          url: SHARE_URL,
        });
        setStatus("shared");
        return;
      } catch (err) {
        // AbortError = user cancelled; quietly reset.
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          return;
        }
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(SHARE_MESSAGE);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  const statusLabel =
    status === "shared"
      ? "Shared"
      : status === "copied"
        ? "Link copied"
        : status === "error"
          ? "Couldn't copy — please share manually."
          : "";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex min-h-[44px] items-center justify-center self-start border border-ink px-6 py-3 text-body font-semibold text-ink transition hover:bg-ink hover:text-ground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
      >
        Share with a friend
      </button>
      <p
        role="status"
        aria-live="polite"
        className={`text-meta uppercase tracking-[0.08em] ${status === "error" ? "text-accent-2-text" : "text-ink-2"}`}
      >
        {statusLabel}
      </p>
    </div>
  );
}
