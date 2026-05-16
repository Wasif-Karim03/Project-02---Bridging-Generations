"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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

// Reuses the shared Field / Input / Textarea primitives so the styling
// matches the contact form + every other auth-adjacent surface on the site.
// Sections use numbered editorial headers (01 / 02 …) to give the long form
// visual rhythm and a sense of progress.
export function StudentApplicationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState<StudentApplicationState | null, FormData>(
    submitStudentApplicationAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-12" noValidate>
      <FormSection
        index="01"
        title="About you"
        subtitle="The basics our reviewers need to place your application."
      >
        <Field label="Full name *">
          {(p) => <Input {...p} name="studentName" autoComplete="name" required maxLength={120} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Date of birth">
            {(p) => <Input {...p} name="dateOfBirth" type="date" />}
          </Field>
          <Field label="Grade / class *" hint="e.g. Class 8 or HSC 1st year">
            {(p) => <Input {...p} name="grade" required maxLength={40} />}
          </Field>
        </div>
        <Field label="School name *">
          {(p) => <Input {...p} name="school" required maxLength={200} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Community / ethnicity">
            {(p) => (
              <SelectInput
                {...p}
                name="ethnicity"
                options={ETHNICITY_OPTIONS}
                placeholder="Select…"
              />
            )}
          </Field>
          <Field label="Family situation">
            {(p) => (
              <label
                htmlFor={p.id}
                className="inline-flex min-h-[48px] items-center gap-3 border border-hairline bg-ground-2 px-4 text-body text-ink"
              >
                <input
                  id={p.id}
                  type="checkbox"
                  name="isOrphan"
                  className="size-4 border border-hairline accent-accent"
                />
                I am an orphan
              </label>
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="02"
        title="Family & guardian"
        subtitle="Who supports you at home and how we can reach them."
      >
        <Field label="Guardian's full name *">
          {(p) => <Input {...p} name="guardianName" required maxLength={120} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Relation to you" hint="e.g. Father, Aunt, Grandparent">
            {(p) => <Input {...p} name="guardianRelation" maxLength={80} />}
          </Field>
          <Field label="Guardian's occupation" hint="e.g. Day laborer, Farmer">
            {(p) => <Input {...p} name="guardianOccupation" maxLength={200} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Guardian's phone *" hint="We may call to verify your application.">
            {(p) => (
              <Input
                {...p}
                name="guardianPhone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={40}
                placeholder="+880 1XXX-XXXXXX"
              />
            )}
          </Field>
          <Field label="Alternate guardian phone" hint="Optional — a second person we can reach.">
            {(p) => (
              <Input
                {...p}
                name="alternateGuardianPhone"
                type="tel"
                inputMode="tel"
                maxLength={40}
              />
            )}
          </Field>
        </div>
        <Field label="Approximate family income">
          {(p) => (
            <SelectInput
              {...p}
              name="familyIncome"
              options={FAMILY_INCOME_OPTIONS}
              placeholder="Select…"
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        index="03"
        title="Where you live & contact"
        subtitle="So we can send your decision letter and stay in touch."
      >
        <Field label="Home address *" hint="Village / area, sub-district, district.">
          {(p) => <Textarea {...p} name="address" required maxLength={2000} rows={3} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Your phone" hint="If you have one — leave blank otherwise.">
            {(p) => <Input {...p} name="phone" type="tel" inputMode="tel" maxLength={40} />}
          </Field>
          <Field label="Email" hint="Defaults to your signup email if you leave it blank.">
            {(p) => (
              <Input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                defaultValue={initialEmail}
                maxLength={255}
              />
            )}
          </Field>
        </div>
        <Field
          label="National ID / birth certificate number"
          hint="Optional — speeds up identity verification when you're approved."
        >
          {(p) => <Input {...p} name="nationalIdNumber" maxLength={40} />}
        </Field>
      </FormSection>

      <FormSection
        index="04"
        title="Emergency contact"
        subtitle="Someone other than your guardian — a teacher, older sibling, community elder."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Full name">
            {(p) => <Input {...p} name="emergencyContactName" maxLength={120} />}
          </Field>
          <Field label="Relation to you" hint="e.g. Teacher, Cousin">
            {(p) => <Input {...p} name="emergencyContactRelation" maxLength={80} />}
          </Field>
        </div>
        <Field label="Phone">
          {(p) => (
            <Input {...p} name="emergencyContactPhone" type="tel" inputMode="tel" maxLength={40} />
          )}
        </Field>
      </FormSection>

      <FormSection
        index="05"
        title="Your story"
        subtitle="The board reads these personally. Be honest — there are no wrong answers."
      >
        <Field label="Hobby" hint="What do you do for fun?">
          {(p) => (
            <Input
              {...p}
              name="hobby"
              maxLength={200}
              placeholder="e.g. Reading, cricket, drawing"
            />
          )}
        </Field>
        <Field label="What do you want to be when you grow up?" hint="Your goal — short or long.">
          {(p) => (
            <Textarea
              {...p}
              name="lifeTarget"
              maxLength={1000}
              rows={3}
              placeholder="e.g. A primary school teacher in my village"
            />
          )}
        </Field>
        <Field
          label="Tell us why you're applying *"
          hint="A few sentences about your situation and what a scholarship would mean to you."
        >
          {(p) => (
            <Textarea
              {...p}
              name="message"
              required
              maxLength={4000}
              rows={6}
              autoCapitalize="sentences"
            />
          )}
        </Field>
      </FormSection>

      {state && !state.ok ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[44ch] text-meta uppercase tracking-[0.06em] text-ink-2">
          Fields marked * are required. We'll redirect you to sign in once you submit.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center justify-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Submit application →"}
        </button>
      </div>
    </form>
  );
}

// Editorial section header — uses the same numbered rhythm the rest of the
// site uses for long-form content (mission/vision, donation-journey, etc.).
function FormSection({
  index,
  title,
  subtitle,
  children,
}: {
  index: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2 border-b border-hairline pb-4">
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-eyebrow uppercase tracking-[0.12em] text-accent">
            {index}
          </span>
          <span className="text-heading-4 text-ink">{title}</span>
        </p>
        <p className="max-w-[60ch] text-body-sm text-ink-2">{subtitle}</p>
      </header>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

// Select styled to match Input. Field passes id + describedby + aria-invalid
// — we forward all of them so error highlighting works.
function SelectInput({
  id,
  name,
  options,
  placeholder,
  ...rest
}: {
  id: string;
  name: string;
  options: readonly string[];
  placeholder?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue=""
      className="min-h-[48px] border border-hairline bg-ground-2 px-4 text-body text-ink focus:border-accent focus:outline-none"
      {...rest}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
