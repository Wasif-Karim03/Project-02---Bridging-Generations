"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { INITIAL_FORM_STATE } from "@/lib/forms";
import { submitScholarshipApplication } from "../actions";

export function ScholarshipApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitScholarshipApplication,
    INITIAL_FORM_STATE,
  );

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
      {/* Honeypot — bots fill in, humans don't see it. */}
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Applicant name *" error={state.fieldErrors.applicantName}>
          {(args) => <Input {...args} name="applicantName" required maxLength={100} />}
        </Field>
        <Field label="Guardian name (optional)">
          {(args) => <Input {...args} name="guardianName" maxLength={100} />}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Email *" error={state.fieldErrors.email}>
          {(args) => <Input {...args} name="email" type="email" required />}
        </Field>
        <Field label="Phone (optional)">
          {(args) => <Input {...args} name="phone" type="tel" autoComplete="tel" />}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="School *" error={state.fieldErrors.school}>
          {(args) => <Input {...args} name="school" required />}
        </Field>
        <Field label="Current grade *" error={state.fieldErrors.grade}>
          {(args) => (
            <Input {...args} name="grade" required placeholder="e.g. 9, 10, HSC 1st year" />
          )}
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Village">{(args) => <Input {...args} name="village" />}</Field>
        <Field label="Region">
          {(args) => <Input {...args} name="region" placeholder="e.g. Bandarban" />}
        </Field>
        <Field label="Family income / month (BDT)">
          {(args) => <Input {...args} name="familyIncome" placeholder="approx." />}
        </Field>
      </div>

      <Field label="Why are you applying for a scholarship? *" error={state.fieldErrors.message}>
        {(args) => (
          <Textarea
            {...args}
            name="message"
            rows={6}
            maxLength={2000}
            required
            placeholder="A few sentences about your situation, what you'd study, and how the scholarship would help."
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
          {pending ? "Sending…" : "Submit application"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Board reviews within 4 weeks
        </p>
      </div>
    </form>
  );
}
