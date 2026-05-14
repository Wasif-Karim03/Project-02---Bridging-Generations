"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { INITIAL_FORM_STATE } from "@/lib/forms";
import { submitStudentSponsorshipApplication } from "../actions";

export function StudentSponsorshipApplicationForm() {
  const [state, formAction, pending] = useActionState(
    submitStudentSponsorshipApplication,
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
      <input
        type="text"
        name="company"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      <fieldset className="flex flex-col gap-5 border-t border-hairline pt-5">
        <legend className="text-eyebrow uppercase tracking-[0.1em] text-accent">
          About the student
        </legend>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Student's name *" error={state.fieldErrors.studentName}>
            {(args) => <Input {...args} name="studentName" required maxLength={100} />}
          </Field>
          <Field label="Date of birth (optional)">
            {(args) => <Input {...args} name="dateOfBirth" type="date" />}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Current grade *" error={state.fieldErrors.grade}>
            {(args) => (
              <Input {...args} name="grade" required placeholder="e.g. 7, 9, SSC, HSC 1st year" />
            )}
          </Field>
          <Field label="School *" error={state.fieldErrors.school}>
            {(args) => <Input {...args} name="school" required />}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[2fr_1fr]">
          <Field label="Ethnicity / community (optional)">
            {(args) => (
              <Input
                {...args}
                name="ethnicity"
                placeholder="e.g. Chakma, Marma, Tanchangya, Tripura, Barua, Bengali"
              />
            )}
          </Field>
          <label className="mt-7 inline-flex items-center gap-2 text-body-sm text-ink">
            <input type="checkbox" name="isOrphan" className="size-5" />
            Student is an orphan
          </label>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-t border-hairline pt-5">
        <legend className="text-eyebrow uppercase tracking-[0.1em] text-accent">
          Guardian / family
        </legend>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Guardian / parent name *" error={state.fieldErrors.guardianName}>
            {(args) => <Input {...args} name="guardianName" required maxLength={100} />}
          </Field>
          <Field label="Relation to student">
            {(args) => <Input {...args} name="guardianRelation" placeholder="e.g. Mother, Aunt" />}
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Guardian occupation">
            {(args) => <Input {...args} name="guardianOccupation" />}
          </Field>
          <Field label="Family income / month (BDT)">
            {(args) => <Input {...args} name="familyIncome" placeholder="approx." />}
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-t border-hairline pt-5">
        <legend className="text-eyebrow uppercase tracking-[0.1em] text-accent">Contact</legend>

        <Field label="Address *" error={state.fieldErrors.address}>
          {(args) => <Textarea {...args} name="address" rows={3} required />}
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Phone (or email)" error={state.fieldErrors.phone}>
            {(args) => <Input {...args} name="phone" type="tel" autoComplete="tel" />}
          </Field>
          <Field label="Email (or phone)" error={state.fieldErrors.email}>
            {(args) => <Input {...args} name="email" type="email" autoComplete="email" />}
          </Field>
        </div>

        <Field label="Anything else we should know? (optional)" error={state.fieldErrors.message}>
          {(args) => (
            <Textarea
              {...args}
              name="message"
              rows={4}
              maxLength={2000}
              placeholder="Optional: family situation, why you're applying, what subject the student wants to focus on."
            />
          )}
        </Field>
      </fieldset>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-body-sm text-accent-2-text">
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Sending…" : "Submit application"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Reviewed at the start of every term
        </p>
      </div>
    </form>
  );
}
