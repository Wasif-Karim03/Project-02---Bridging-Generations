"use client";

import { useActionState } from "react";
import { type StudentApplicationState, submitStudentApplicationAction } from "../actions";

const FAMILY_INCOME_OPTIONS = [
  "Under 5,000 BDT / month",
  "5,000 — 10,000 BDT / month",
  "10,000 — 20,000 BDT / month",
  "20,000 — 40,000 BDT / month",
  "Over 40,000 BDT / month",
  "Prefer not to say",
] as const;

const ETHNICITY_OPTIONS = [
  "Chakma",
  "Marma",
  "Tripura",
  "Tanchangya",
  "Mro",
  "Bengali",
  "Other",
  "Prefer not to say",
] as const;

export function StudentApplicationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState<StudentApplicationState | null, FormData>(
    submitStudentApplicationAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Section title="Your information">
        <Field label="Full name" name="studentName" required maxLength={120} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Date of birth" name="dateOfBirth" type="date" />
          <Field
            label="Grade / class"
            name="grade"
            required
            maxLength={40}
            placeholder="e.g. Class 8"
          />
        </div>
        <Field label="School name" name="school" required maxLength={200} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Community / ethnicity" name="ethnicity" options={ETHNICITY_OPTIONS} />
          <CheckboxField label="I am an orphan" name="isOrphan" />
        </div>
      </Section>

      <Section title="Family / guardian">
        <Field label="Guardian's full name" name="guardianName" required maxLength={120} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Relation to you"
            name="guardianRelation"
            maxLength={80}
            placeholder="e.g. Father, Aunt, Grandparent"
          />
          <Field
            label="Guardian's occupation"
            name="guardianOccupation"
            maxLength={200}
            placeholder="e.g. Day laborer, Farmer"
          />
        </div>
        <SelectField
          label="Approximate family income"
          name="familyIncome"
          options={FAMILY_INCOME_OPTIONS}
        />
      </Section>

      <Section title="Where you live + contact">
        <Field label="Home address" name="address" required multiline maxLength={2000} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" name="phone" type="tel" maxLength={40} />
          <Field
            label="Email (we'll use your signup email if blank)"
            name="email"
            type="email"
            defaultValue={initialEmail}
            maxLength={255}
          />
        </div>
      </Section>

      <Section title="About you">
        <Field
          label="Hobby"
          name="hobby"
          maxLength={200}
          placeholder="e.g. Reading, cricket, drawing"
        />
        <Field
          label="What do you want to be when you grow up?"
          name="lifeTarget"
          maxLength={1000}
          multiline
          placeholder="e.g. A primary school teacher in my village"
        />
        <Field
          label="Tell us why you're applying"
          name="message"
          required
          multiline
          maxLength={4000}
          placeholder="A few sentences about your situation and what a scholarship would mean to you."
        />
      </Section>

      {state && !state.ok ? (
        <p
          role="alert"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-2 text-body-sm text-accent-2-text"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-hairline pt-5">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          You'll be redirected to sign in once submitted.
        </p>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4 border border-hairline bg-ground-2 p-5">
      <legend className="px-1 text-eyebrow uppercase tracking-[0.1em] text-accent">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  maxLength,
  placeholder,
  defaultValue,
  multiline = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
}) {
  const id = `student-field-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta uppercase tracking-[0.06em] text-ink-2">
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          required={required}
          maxLength={maxLength}
          rows={3}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="border border-hairline bg-ground px-3 py-2 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          required={required}
          maxLength={maxLength}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="min-h-[40px] border border-hairline bg-ground px-3 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly string[];
}) {
  const id = `student-field-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta uppercase tracking-[0.06em] text-ink-2">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        className="min-h-[40px] border border-hairline bg-ground px-3 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({ label, name }: { label: string; name: string }) {
  return (
    <label className="inline-flex items-center gap-2 text-body text-ink">
      <input type="checkbox" name={name} className="size-4 border border-hairline" />
      {label}
    </label>
  );
}
