"use client";

import { useState } from "react";

type SharePostProps = {
  title: string;
  url?: string;
  className?: string;
};

export function SharePost({ title, url, className }: SharePostProps) {
  const [toast, setToast] = useState<string | null>(null);

  async function onClick() {
    const target = url ?? (typeof window !== "undefined" ? window.location.href : "");
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url: target });
        return;
      } catch {
        // User dismissed or share failed; fall through to clipboard.
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(target);
        setToast("Link copied");
        window.setTimeout(() => setToast(null), 2000);
        return;
      } catch {
        setToast("Copy failed");
        window.setTimeout(() => setToast(null), 2000);
      }
    }
  }

  return (
    <div className={`share-rail ${className ?? ""}`.trim()}>
      <button type="button" className="share-rail__button" onClick={onClick}>
        Share
      </button>
      <span
        className="share-rail__toast"
        data-visible={toast ? "true" : "false"}
        aria-live="polite"
      >
        {toast ?? ""}
      </span>
    </div>
  );
}
