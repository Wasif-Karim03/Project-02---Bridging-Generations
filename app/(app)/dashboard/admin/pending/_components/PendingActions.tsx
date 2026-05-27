"use client";

import { useState, useTransition } from "react";
import { approvePendingSignupAction, rejectPendingSignupAction } from "../actions";

export function PendingActions({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);

  function onApprove() {
    startTransition(async () => {
      await approvePendingSignupAction(userId);
    });
  }

  function onConfirmReject(formData: FormData) {
    startTransition(async () => {
      await rejectPendingSignupAction(userId, formData);
      setRejecting(false);
    });
  }

  if (rejecting) {
    return (
      <form action={onConfirmReject} className="flex flex-col gap-2">
        <textarea
          name="reason"
          rows={2}
          maxLength={2000}
          placeholder="Optional reason (sent to applicant)…"
          className="border border-hairline bg-ground-2 px-3 py-2 text-body-sm text-ink focus:border-accent focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[36px] items-center bg-accent-2-text px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent-2-hover disabled:opacity-60"
          >
            {pending ? "Sending…" : "Confirm reject"}
          </button>
          <button
            type="button"
            onClick={() => setRejecting(false)}
            disabled={pending}
            className="inline-flex min-h-[36px] items-center border border-hairline px-3 text-nav-link uppercase text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onApprove}
        disabled={pending}
        className="inline-flex min-h-[36px] items-center bg-accent px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {pending ? "Approving…" : "Approve"}
      </button>
      <button
        type="button"
        onClick={() => setRejecting(true)}
        disabled={pending}
        className="inline-flex min-h-[36px] items-center border border-hairline px-3 text-nav-link uppercase text-ink transition-colors hover:border-accent-2-text hover:text-accent-2-text disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}
