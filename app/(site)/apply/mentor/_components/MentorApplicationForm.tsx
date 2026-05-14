"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { INITIAL_FORM_STATE } from "@/lib/forms";
import { submitMentorApplication } from "../actions";

export function MentorApplicationForm() {
  const [state, formAction, pending] = useActionState(submitMentorApplication, INITIAL_FORM_STATE);

  if (state.status === "success") {
    return (
      <div role="status" className="border border-accent bg-accent/5 p-6 text-body text-ink">
        <p className="text-heading-5 text-accent">Application received.</p>
        <p className="mt-2 text-body-sm text-ink-2">{state.message}</p>
        {state.submittedEmail ? (
          <p className="mt-2 text-meta uppercase tracking-[0.06em] text-ink-2">
            We'll reply to <strong>{state.submittedEmail}</strong>.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name *" error={state.fieldErrors.name}>
          {(args) => <Input {...args} name="name" required maxLength={100} />}
        </Field>
        <Field label="Email *" error={state.fieldErrors.email}>
          {(args) => <Input {...args} name="email" type="email" required />}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Country">
          {(args) => <Input {...args} name="country" placeholder="e.g. Canada" />}
        </Field>
        <Field label="Occupation / status">
          {(args) => (
            <Input
              {...args}
              name="occupation"
              placeholder="e.g. Software engineer, university student"
            />
          )}
        </Field>
      </div>

      <Field label="Education status">
        {(args) => (
          <Input
            {...args}
            name="educationStatus"
            placeholder="e.g. B.Sc. Computer Science, currently in 2nd year of M.A. English"
          />
        )}
      </Field>

      <Field label="Subjects / expertise you can mentor *" error={state.fieldErrors.subjects}>
        {(args) => (
          <Input
            {...args}
            name="subjects"
            required
            placeholder="e.g. Math, English, university prep, study habits"
          />
        )}
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Hours per week you can commit">
          {(args) => <Input {...args} name="hoursPerWeek" placeholder="e.g. 2" />}
        </Field>
        <Field label="Available from (term/date)">
          {(args) => <Input {...args} name="startTerm" placeholder="e.g. Spring 2026" />}
        </Field>
      </div>

      <Field label="Why do you want to mentor? *" error={state.fieldErrors.whyMentor}>
        {(args) => (
          <Textarea
            {...args}
            name="whyMentor"
            rows={6}
            maxLength={2000}
            required
            placeholder="A few sentences about why you want to mentor students at Bridging Generations."
          />
        )}
      </Field>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body-sm text-accent-2-text">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Apply as mentor"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Board reviews within 3 weeks
        </p>
      </div>
    </form>
  );
}
