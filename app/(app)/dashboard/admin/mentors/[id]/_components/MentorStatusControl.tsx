"use client";

import { useState, useTransition } from "react";
import { reinstateMentorshipAction, stopMentorshipAction } from "../actions";

export function MentorStatusControl({
  mentorUserId,
  stopped,
}: {
  mentorUserId: string;
  stopped: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) setError(result.error);
      else setConfirming(false);
    });
  }

  const btn =
    "inline-flex min-h-[40px] items-center px-4 text-nav-link uppercase transition-colors disabled:opacity-60";

  return (
    <div className="flex flex-col gap-2">
      {stopped ? (
        <>
          <p className="text-body-sm text-ink-2">
            This mentorship is <strong className="text-accent-2-text">stopped</strong> — the mentor
            can't access their dashboard.
          </p>
          <button
            type="button"
            onClick={() => run(() => reinstateMentorshipAction(mentorUserId))}
            disabled={pending}
            className={`${btn} w-fit bg-accent text-white hover:bg-accent/90`}
          >
            {pending ? "Reinstating…" : "Reinstate mentorship"}
          </button>
        </>
      ) : confirming ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-body-sm text-ink">Stop this mentorship?</span>
          <button
            type="button"
            onClick={() => run(() => stopMentorshipAction(mentorUserId))}
            disabled={pending}
            className={`${btn} bg-accent-2-text text-white hover:bg-accent-2-hover`}
          >
            {pending ? "Stopping…" : "Yes, stop"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className={`${btn} border border-hairline text-ink hover:border-accent`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className={`${btn} w-fit border border-accent-2-text text-accent-2-text hover:bg-accent-2-text hover:text-white`}
        >
          Stop mentorship
        </button>
      )}
      {error ? (
        <p role="alert" className="text-accent-2-text text-meta">
          {error}
        </p>
      ) : null}
    </div>
  );
}
