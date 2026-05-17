"use client";

import { useState, useTransition } from "react";
import { adminRejectStudentAction } from "../actions";

// "Reject this application" affordance for the admin students table. Lives
// inside a <details> so the textarea + confirm button stay collapsed until
// the admin actually wants to use them — keeps the row compact. The reason
// is optional but recommended (the student sees it in the rejection email).

type Props = {
  userId: string;
  studentName: string;
};

export function StudentRejectControl({ userId, studentName }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [open, setOpen] = useState(false);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await adminRejectStudentAction(userId, formData);
      setMessage(
        result.ok
          ? { kind: "ok", text: "Rejected — email sent." }
          : { kind: "err", text: result.error },
      );
      if (result.ok) setOpen(false);
    });
  }

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group"
    >
      <summary className="inline-flex min-h-[34px] cursor-pointer items-center border border-accent-2-text px-3 text-meta uppercase text-accent-2-text hover:bg-accent-2-text hover:text-white">
        {open ? "Cancel" : "Reject"}
      </summary>
      <form action={onSubmit} className="mt-2 flex flex-col gap-2">
        <label
          htmlFor={`reject-reason-${userId}`}
          className="text-meta uppercase tracking-[0.06em] text-ink-2"
        >
          Reason for {studentName} (optional)
        </label>
        <textarea
          id={`reject-reason-${userId}`}
          name="reason"
          rows={3}
          maxLength={1000}
          placeholder="Optional — what you write here is included in the student's rejection email."
          className="min-w-[260px] border border-hairline bg-ground px-2 py-1.5 text-body-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[34px] items-center border border-accent-2-text bg-accent-2-text px-3 text-meta uppercase text-white hover:bg-accent-2-text/90 disabled:opacity-50"
          >
            {pending ? "Rejecting…" : "Confirm rejection"}
          </button>
          {message ? (
            <span
              role={message.kind === "err" ? "alert" : "status"}
              className={
                message.kind === "ok"
                  ? "text-meta uppercase tracking-[0.06em] text-accent"
                  : "text-meta uppercase tracking-[0.06em] text-accent-2-text"
              }
            >
              {message.text}
            </span>
          ) : null}
        </div>
      </form>
    </details>
  );
}
