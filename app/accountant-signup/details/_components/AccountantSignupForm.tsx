"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitAccountantSignupAction } from "../actions";

type Props = {
  initialEmail?: string;
  initialName?: string;
};

// Matches the section-numbered editorial pattern used by StudentApplicationForm.
// Two sections — "About you" + "About the role". Honeypot field `company` is
// included (hidden) per the codebase's public-form anti-spam convention.
export function AccountantSignupForm({ initialEmail, initialName }: Props) {
  const [state, formAction, pending] = useActionState(submitAccountantSignupAction, null);
  const error = state && state.ok === false ? state.error : null;

  return (
    <form action={formAction} className="flex flex-col gap-10">
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {error}
        </p>
      ) : null}

      <FormSection
        index="01"
        title="About you"
        subtitle="The board uses this to make sure they're talking to the right person."
      >
        <Field label="Full name" hint="Your legal name as you'd like it to appear on records.">
          {(p) => (
            <Input
              {...p}
              name="fullName"
              required
              autoComplete="name"
              defaultValue={initialName ?? ""}
            />
          )}
        </Field>
        <Field
          label="Email"
          hint="We pulled this from your signup — read-only here so admins can match the application to your account."
        >
          {(p) => (
            <Input {...p} name="emailDisplay" defaultValue={initialEmail ?? ""} readOnly disabled />
          )}
        </Field>
        <Field label="Phone" hint="Optional — useful if we need to reach you quickly.">
          {(p) => <Input {...p} name="phone" type="tel" autoComplete="tel" />}
        </Field>
        <Field label="Address" hint="Optional. Helps us know where in the region you're based.">
          {(p) => <Textarea {...p} name="address" rows={3} />}
        </Field>
        <Field label="Profile picture URL" hint="Optional. Direct link to an image (PNG/JPG).">
          {(p) => (
            <Input {...p} name="photoUrl" type="url" placeholder="https://..." inputMode="url" />
          )}
        </Field>
      </FormSection>

      <FormSection
        index="02"
        title="About the role"
        subtitle="The board will read this carefully. Be specific — what you'd handle, why, and how long."
      >
        <Field label="Starting date" hint="Approximate date you'd be available to start.">
          {(p) => <Input {...p} name="startDate" type="date" />}
        </Field>
        <Field label="Expected ending date" hint="Approximate. You can update this later.">
          {(p) => <Input {...p} name="expectedEndDate" type="date" />}
        </Field>
        <Field
          label="Why do you want to be an accountant?"
          hint="A few sentences are enough. We're looking for fit + commitment, not polish."
        >
          {(p) => <Textarea {...p} name="whyAccountant" required rows={6} maxLength={4000} />}
        </Field>
      </FormSection>

      {/* Honeypot — hidden from real users, catches bots that fill every field. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit application"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Goes to the board for review.
        </p>
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
