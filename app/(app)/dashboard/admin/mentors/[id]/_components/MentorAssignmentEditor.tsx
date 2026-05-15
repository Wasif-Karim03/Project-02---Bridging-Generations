"use client";

import { useState, useTransition } from "react";
import { assignStudentAction, unassignStudentAction } from "../actions";

type Props = {
  mentorUserId: string;
  assignedSlugs: string[];
  unassignedOptions: { slug: string; label: string }[];
  studentBySlug: Record<string, string>;
};

export function MentorAssignmentEditor({
  mentorUserId,
  assignedSlugs,
  unassignedOptions,
  studentBySlug,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onAssign(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await assignStudentAction(mentorUserId, formData);
      setMessage(
        result.ok ? { kind: "ok", text: "Student assigned." } : { kind: "err", text: result.error },
      );
    });
  }

  function onUnassign(slug: string) {
    setMessage(null);
    startTransition(async () => {
      const result = await unassignStudentAction(mentorUserId, slug);
      setMessage(
        result.ok
          ? { kind: "ok", text: "Assignment removed." }
          : { kind: "err", text: result.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Currently assigned</p>
        {assignedSlugs.length === 0 ? (
          <p className="text-body-sm text-ink-2">No students assigned yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {assignedSlugs.map((slug) => (
              <li
                key={slug}
                className="inline-flex items-center gap-2 border border-hairline bg-ground-2 px-3 py-1.5 text-body-sm text-ink"
              >
                <span>{studentBySlug[slug] ?? slug}</span>
                <button
                  type="button"
                  onClick={() => onUnassign(slug)}
                  disabled={pending}
                  aria-label={`Remove ${studentBySlug[slug] ?? slug}`}
                  className="text-meta uppercase tracking-[0.06em] text-accent-2-text hover:text-accent disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={onAssign} className="flex flex-col gap-3 border-t border-hairline pt-5">
        <label
          htmlFor="assign-student-slug"
          className="text-meta uppercase tracking-[0.06em] text-ink-2"
        >
          Add a student
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <select
            id="assign-student-slug"
            name="studentSlug"
            required
            disabled={pending || unassignedOptions.length === 0}
            defaultValue=""
            className="min-h-[40px] min-w-[260px] border border-hairline bg-ground px-3 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="" disabled>
              {unassignedOptions.length === 0 ? "All students assigned" : "Select a student…"}
            </option>
            {unassignedOptions.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending || unassignedOptions.length === 0}
            className="inline-flex min-h-[40px] items-center bg-accent px-4 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {pending ? "Working…" : "Assign"}
          </button>
        </div>
      </form>

      {message ? (
        <p
          role={message.kind === "err" ? "alert" : "status"}
          className={
            message.kind === "ok"
              ? "border border-accent bg-accent/10 px-4 py-2 text-body-sm text-ink"
              : "border border-accent-2-text bg-accent-2-text/10 px-4 py-2 text-body-sm text-accent-2-text"
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
