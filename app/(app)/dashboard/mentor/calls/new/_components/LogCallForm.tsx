"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type {
  MentorCallQuestion,
  MentorCallSection,
  MentorGuidancePoint,
} from "@/lib/mentor/callQuestions";
import { logMentorCallAction } from "../actions";

type Props = {
  studentOptions: Array<{ slug: string; label: string }>;
  lockedStudent?: { slug: string; label: string } | null;
  questions: MentorCallQuestion[];
  sections: MentorCallSection[];
  guidance: MentorGuidancePoint[];
};

export function LogCallForm({
  studentOptions,
  lockedStudent,
  questions,
  sections,
  guidance,
}: Props) {
  const [state, formAction, pending] = useActionState(logMentorCallAction, null);
  const error = state && state.ok === false ? state.error : null;
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {error}
        </p>
      ) : null}

      {/* How-to-mentor reference — collapsed by default so it guides without
          getting in the way. */}
      <details className="border border-hairline bg-ground-2">
        <summary className="cursor-pointer list-none px-4 py-3 text-meta uppercase tracking-[0.06em] text-accent hover:bg-ground-3">
          How to mentor — quick guide ▾
        </summary>
        <ul className="flex flex-col gap-3 border-hairline border-t px-4 py-4">
          {guidance.map((g) => (
            <li key={g.en} className="text-body-sm">
              <p className="text-ink">{g.en}</p>
              <p className="mt-0.5 text-ink-2">{g.bn}</p>
            </li>
          ))}
        </ul>
      </details>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {lockedStudent ? (
          <Field label="Student">
            {(p) => (
              <>
                <input type="hidden" name="studentSlug" value={lockedStudent.slug} />
                <p
                  {...p}
                  className="border border-hairline bg-ground-3 px-4 py-3 text-body text-ink"
                >
                  {lockedStudent.label}
                </p>
              </>
            )}
          </Field>
        ) : (
          <Field label="Student">
            {(p) => (
              <select
                {...p}
                name="studentSlug"
                required
                defaultValue=""
                className="border border-hairline bg-ground-2 px-4 py-3 text-body text-ink focus:border-accent focus:outline-none"
              >
                <option value="" disabled>
                  Pick a student
                </option>
                {studentOptions.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        <Field label="Call date">
          {(p) => <Input {...p} name="calledAt" type="date" required defaultValue={todayIso} />}
        </Field>
      </div>

      <p className="text-body-sm text-ink-2">
        Fill in what's relevant — every question is optional. Each prompt shows English and Bangla;
        ask from whichever the student is more comfortable with.
      </p>

      {/* One collapsible block per section; the first (check-in) starts open. */}
      {sections.map((sec, i) => {
        const items = questions.filter((q) => q.section === sec.key);
        if (items.length === 0) return null;
        return (
          <details key={sec.key} open={i === 0} className="border border-hairline bg-ground">
            <summary className="cursor-pointer list-none border-hairline border-b px-4 py-3 hover:bg-ground-2">
              <span className="text-eyebrow uppercase tracking-[0.1em] text-accent">
                {sec.title}
              </span>
              <span className="ml-2 text-meta text-ink-2">{sec.titleBn}</span>
            </summary>
            <div className="flex flex-col gap-5 px-4 py-4">
              {items.map((q) => (
                <Field key={q.id} label={q.prompt} hint={q.promptBn}>
                  {(p) => <Textarea {...p} name={`ans_${q.id}`} rows={2} maxLength={2000} />}
                </Field>
              ))}
            </div>
          </details>
        );
      })}

      <Field
        label="Additional notes"
        hint="Anything else worth recording (private to mentor + admin)."
      >
        {(p) => <Textarea {...p} name="notes" rows={3} maxLength={4000} />}
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save call"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Next call auto-scheduled 15 days from the call date.
        </p>
      </div>
    </form>
  );
}
