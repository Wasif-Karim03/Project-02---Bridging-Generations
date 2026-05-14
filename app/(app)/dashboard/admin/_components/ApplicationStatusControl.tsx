"use client";

import { useTransition } from "react";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { setApplicationStatusAction } from "../actions";

type Props = {
  kind: ApplicationRow["kind"];
  id: string;
  current: ApplicationStatus;
};

const NEXT_BUTTONS: ApplicationStatus[] = ["submitted", "under_review", "approved", "rejected"];

const BUTTON_LABEL: Record<ApplicationStatus, string> = {
  submitted: "New",
  under_review: "Review",
  approved: "Approve",
  rejected: "Reject",
  withdrawn: "Withdraw",
};

// Admin row-level status switch. Calls the server action; the page revalidates
// after success so the table re-renders with the new status.
export function ApplicationStatusControl({ kind, id, current }: Props) {
  const [pending, startTransition] = useTransition();

  function setStatus(next: ApplicationStatus) {
    if (next === current) return;
    startTransition(async () => {
      await setApplicationStatusAction(kind, id, next);
    });
  }

  return (
    <div className="inline-flex gap-1">
      {NEXT_BUTTONS.map((status) => {
        const isCurrent = status === current;
        return (
          <button
            key={status}
            type="button"
            disabled={pending || isCurrent}
            onClick={() => setStatus(status)}
            className={
              isCurrent
                ? "h-8 bg-accent px-2 text-meta uppercase tracking-[0.06em] text-white"
                : "h-8 border border-hairline bg-ground-2 px-2 text-meta uppercase tracking-[0.06em] text-ink-2 hover:border-accent hover:text-accent disabled:opacity-50"
            }
            aria-pressed={isCurrent}
            title={`Set to ${BUTTON_LABEL[status]}`}
          >
            {BUTTON_LABEL[status]}
          </button>
        );
      })}
    </div>
  );
}
