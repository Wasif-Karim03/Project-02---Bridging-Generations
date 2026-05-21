"use client";

import { useActionState } from "react";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { APPLICATION_STATUS_LABEL } from "@/lib/content/applicationsMock";
import { INITIAL_REVIEW_STATE, submitApplicationReview } from "../actions";

const SELECTABLE_STATUSES: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
];

type Props = {
  kind: ApplicationRow["kind"];
  id: string;
  currentStatus: ApplicationStatus;
  initialNotes: string;
};

export function ReviewControls({ kind, id, currentStatus, initialNotes }: Props) {
  const [state, formAction, isPending] = useActionState(
    submitApplicationReview,
    INITIAL_REVIEW_STATE,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 border border-hairline bg-ground-2 p-5"
    >
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />

      <label className="flex flex-col gap-1">
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Status</span>
        <select
          name="status"
          defaultValue={currentStatus}
          className="border border-hairline bg-ground px-3 py-2 text-body text-ink focus:border-accent focus:outline-none"
        >
          {SELECTABLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Reviewer notes</span>
        <textarea
          name="notes"
          defaultValue={initialNotes}
          rows={5}
          placeholder="Context, rationale, follow-up actions… visible to other admins only."
          className="border border-hairline bg-ground px-3 py-2 text-body text-ink focus:border-accent focus:outline-none"
        />
        <span className="text-meta text-ink-2">
          Notes are stored against the application row and shown to every admin reviewing it later.
        </span>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-[44px] items-center justify-center bg-accent px-4 text-nav-link uppercase text-white transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save review"}
      </button>

      {state.status !== "idle" ? (
        <p
          role="status"
          className={`text-meta uppercase tracking-[0.06em] ${
            state.status === "success" ? "text-accent" : "text-accent-2-text"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
