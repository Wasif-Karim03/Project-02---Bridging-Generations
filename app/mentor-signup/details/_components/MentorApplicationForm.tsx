"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { type MentorApplicationState, submitMentorApplicationAction } from "../actions";

const HOURS_OPTIONS = [
  "1–2 hrs / week",
  "3–4 hrs / week",
  "5–6 hrs / week",
  "7+ hrs / week",
  "Flexible",
] as const;

const START_TERM_OPTIONS = [
  "Immediately",
  "Within the next month",
  "Next term",
  "Next 3 months",
  "Flexible",
] as const;

export function MentorApplicationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState<MentorApplicationState | null, FormData>(
    submitMentorApplicationAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-12" noValidate>
      <FormSection
        index="01"
        title="About you"
        subtitle="The basics our reviewers need to identify your application."
      >
        <Field label="Full name *">
          {(p) => <Input {...p} name="name" autoComplete="name" required maxLength={120} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
          <Field label="Phone *" hint="Include country code, e.g. +880 1XXX-XXXXXX">
            {(p) => (
              <Input
                {...p}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                maxLength={40}
              />
            )}
          </Field>
        </div>
        <Field label="Country" hint="Where you currently live.">
          {(p) => <Input {...p} name="country" maxLength={80} placeholder="e.g. Bangladesh" />}
        </Field>
        <Field
          label="Photo URL"
          hint="Optional link to a recent profile photo — LinkedIn, Google Drive, etc."
        >
          {(p) => (
            <Input
              {...p}
              name="photoUrl"
              type="url"
              inputMode="url"
              maxLength={2000}
              placeholder="https://…"
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        index="02"
        title="Where you live"
        subtitle="So we can send your decision letter and stay in touch."
      >
        <Field
          label="Full address *"
          hint="Street, city, district, country — wherever your post arrives."
        >
          {(p) => <Textarea {...p} name="address" required maxLength={2000} rows={3} />}
        </Field>
      </FormSection>

      <FormSection
        index="03"
        title="Education & profession"
        subtitle="Tells us where you are in your journey."
      >
        <Field label="School / college / university *" hint="Most recent or current institution.">
          {(p) => (
            <Input
              {...p}
              name="educationStatus"
              required
              maxLength={200}
              placeholder="e.g. Dhaka University, Notre Dame College"
            />
          )}
        </Field>
        <Field
          label="Class / year of study"
          hint="e.g. Class 12, BSc Year 3, MBBS Final Year, Graduated 2022"
        >
          {(p) => <Input {...p} name="classOrYear" maxLength={120} />}
        </Field>
        <Field label="Profession *" hint="What you do now — student, teacher, engineer, etc.">
          {(p) => (
            <Input
              {...p}
              name="occupation"
              required
              maxLength={200}
              placeholder="e.g. Software Engineer · University Student"
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        index="04"
        title="Mentoring availability"
        subtitle="What you'd teach and how much time you can give."
      >
        <Field
          label="Subjects you can mentor *"
          hint="Comma-separated — e.g. Math, Physics, English, College essays"
        >
          {(p) => <Textarea {...p} name="subjects" required maxLength={400} rows={2} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Hours per week">
            {(p) => (
              <SelectInput
                {...p}
                name="hoursPerWeek"
                options={HOURS_OPTIONS}
                placeholder="Select…"
              />
            )}
          </Field>
          <Field label="When can you start?">
            {(p) => (
              <SelectInput
                {...p}
                name="startTerm"
                options={START_TERM_OPTIONS}
                placeholder="Select…"
              />
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="05"
        title="Your story"
        subtitle="The board reads these personally. Be honest — there are no wrong answers."
      >
        <Field
          label="Why do you want to mentor? *"
          hint="A few sentences about your motivation and what you hope to offer."
        >
          {(p) => (
            <Textarea
              {...p}
              name="whyMentor"
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
          Fields marked * are required. We'll send your profile for review once you submit.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center justify-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : "Send for review →"}
        </button>
      </div>
    </form>
  );
}

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
