"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { MentorCallQuestion } from "@/lib/mentor/callQuestions";
import { logMentorCallAction } from "../actions";

type Props = {
  studentOptions: Array<{ slug: string; label: string }>;
  questions: MentorCallQuestion[];
};

export function LogCallForm({ studentOptions, questions }: Props) {
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        <Field label="Call date">
          {(p) => <Input {...p} name="calledAt" type="date" required defaultValue={todayIso} />}
        </Field>
      </div>

      <section className="flex flex-col gap-5">
        {questions.map((q) => (
          <Field key={q.id} label={q.prompt} hint={q.hint}>
            {(p) => <Textarea {...p} name={`ans_${q.id}`} rows={3} maxLength={2000} />}
          </Field>
        ))}
      </section>

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
