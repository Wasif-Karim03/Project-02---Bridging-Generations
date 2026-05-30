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
  "Barua",
  "Bengali",
  "Other",
  "Prefer not to say",
] as const;

// Mirrors the org's paper scholarship application form, section by section.
// Reuses the shared Field / Input / Textarea primitives so styling matches the
// rest of the site. The passport photo is uploaded and stored privately in the
// database (never the public repo).
export function StudentApplicationForm({ initialEmail }: { initialEmail?: string }) {
  const [state, formAction, pending] = useActionState<StudentApplicationState | null, FormData>(
    submitStudentApplicationAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-12" noValidate>
      <FormSection
        index="01"
        title="Student details"
        subtitle="The student's own information, and a recent passport-style photo."
      >
        <Field
          label="Passport-style photo"
          hint="A clear head-and-shoulders photo. JPG, PNG, or WebP, up to 3MB. Kept private."
        >
          {(p) => (
            <input
              id={p.id}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-body-sm text-ink file:mr-4 file:min-h-[44px] file:cursor-pointer file:border-0 file:bg-accent file:px-4 file:text-nav-link file:uppercase file:text-white"
            />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Registration No." hint="Leave blank if not assigned yet.">
            {(p) => <Input {...p} name="registrationNo" maxLength={60} />}
          </Field>
          <Field label="Full name *">
            {(p) => (
              <Input {...p} name="studentName" autoComplete="name" required maxLength={120} />
            )}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Gender">
            {(p) => (
              <NativeSelect {...p} name="gender" placeholder="Select…">
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </NativeSelect>
            )}
          </Field>
          <Field label="Date of birth">
            {(p) => <Input {...p} name="dateOfBirth" type="date" />}
          </Field>
          <Field label="An orphan?">
            {(p) => (
              <NativeSelect {...p} name="isOrphan" defaultValue="no">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </NativeSelect>
            )}
          </Field>
        </div>
        <Field label="Ethnicity">
          {(p) => (
            <NativeSelect {...p} name="ethnicity" placeholder="Select…">
              {ETHNICITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
      </FormSection>

      <FormSection index="02" title="Parents" subtitle="The student's mother and father.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Father's name">
            {(p) => <Input {...p} name="fatherName" maxLength={120} />}
          </Field>
          <Field label="Mother's name">
            {(p) => <Input {...p} name="motherName" maxLength={120} />}
          </Field>
        </div>
        <Field label="Contact" hint="A phone number to reach the parents.">
          {(p) => <Input {...p} name="parentsContact" type="tel" inputMode="tel" maxLength={40} />}
        </Field>
      </FormSection>

      <FormSection index="03" title="Address" subtitle="Where the student and family live.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Village / area">
            {(p) => <Input {...p} name="village" maxLength={200} />}
          </Field>
          <Field label="Post office">
            {(p) => <Input {...p} name="postOffice" maxLength={160} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Police station / upazila">
            {(p) => <Input {...p} name="policeStation" maxLength={160} />}
          </Field>
          <Field label="District">{(p) => <Input {...p} name="district" maxLength={120} />}</Field>
        </div>
      </FormSection>

      <FormSection index="04" title="Academic info" subtitle="The student's class and school.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Class *" hint="e.g. 7, Class 8, HSC 1st year">
            {(p) => <Input {...p} name="grade" required maxLength={40} />}
          </Field>
          <Field label="School / institute *">
            {(p) => <Input {...p} name="school" required maxLength={200} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Current roll no.">
            {(p) => <Input {...p} name="currentRollNo" maxLength={60} />}
          </Field>
          <Field label="Former roll no.">
            {(p) => <Input {...p} name="formerRollNo" maxLength={60} />}
          </Field>
          <Field label="Total students in class">
            {(p) => <Input {...p} name="totalStudents" maxLength={40} />}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="05"
        title="Family & financial"
        subtitle="The family's situation and what the student is asking for."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Father's profession" hint="e.g. Day laborer, Un-employed">
            {(p) => <Input {...p} name="fatherProfession" maxLength={160} />}
          </Field>
          <Field label="Mother's profession" hint="e.g. House-wife">
            {(p) => <Input {...p} name="motherProfession" maxLength={160} />}
          </Field>
        </div>
        <Field
          label="Family monthly income"
          hint="Pick a range, or type an amount below in Purpose."
        >
          {(p) => (
            <NativeSelect {...p} name="familyIncome" placeholder="Select…">
              {FAMILY_INCOME_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
        <Field
          label="Purpose"
          hint="What the support is for, and any income detail (e.g. 'Day labour, 3000/= per month')."
        >
          {(p) => <Textarea {...p} name="purpose" rows={2} maxLength={2000} />}
        </Field>
        <Field label="Required amount" hint="e.g. 2000/-">
          {(p) => <Input {...p} name="requiredAmount" maxLength={60} />}
        </Field>
      </FormSection>

      <FormSection
        index="06"
        title="Amount nature"
        subtitle="How the requested amount should be paid."
      >
        <Field label="Payment type">
          {(p) => (
            <div
              id={p.id}
              className="flex flex-wrap gap-6 border border-hairline bg-ground-2 px-4 py-3 text-body text-ink"
            >
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="amountNature"
                  value="installments"
                  defaultChecked
                  className="size-4 accent-accent"
                />
                By installments
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="amountNature"
                  value="one_time"
                  className="size-4 accent-accent"
                />
                One time
              </label>
            </div>
          )}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Per installment" hint="Amount per installment, if by installments.">
            {(p) => <Input {...p} name="perInstallment" maxLength={60} />}
          </Field>
          <Field label="Duration">
            {(p) => (
              <div className="flex gap-3">
                <Input {...p} name="durationValue" maxLength={40} placeholder="e.g. 2" />
                <NativeSelect id={`${p.id}-unit`} name="durationUnit" defaultValue="years">
                  <option value="years">years</option>
                  <option value="months">months</option>
                </NativeSelect>
              </div>
            )}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="07"
        title="Guardian"
        subtitle="The guardian responsible for the student (if different from a parent)."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Guardian's name">
            {(p) => <Input {...p} name="guardianName" maxLength={120} />}
          </Field>
          <Field label="Guardian's contact">
            {(p) => <Input {...p} name="guardianPhone" type="tel" inputMode="tel" maxLength={40} />}
          </Field>
        </div>
        <Field label="Guardian's address">
          {(p) => <Textarea {...p} name="guardianAddress" rows={2} maxLength={2000} />}
        </Field>
      </FormSection>

      <FormSection index="08" title="Other" subtitle="Anything else the board should know.">
        <Field label="Comment" hint="A short note about the student's situation.">
          {(p) => (
            <Textarea
              {...p}
              name="message"
              rows={4}
              maxLength={4000}
              autoCapitalize="sentences"
              placeholder="e.g. She is a good student; her father is un-employed since the corona disaster."
            />
          )}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Student signature" hint="Type the student's name to sign.">
            {(p) => <Input {...p} name="studentSignature" maxLength={160} />}
          </Field>
          <Field label="Contact" hint="A phone number to reach the student.">
            {(p) => <Input {...p} name="phone" type="tel" inputMode="tel" maxLength={40} />}
          </Field>
        </div>
        <Field label="Email" hint="Defaults to your signup email if left blank.">
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

// Editorial section header — numbered rhythm matching the rest of the site.
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

// Select styled to match Input. Field passes id + describedby + aria-invalid,
// which we forward so error highlighting works.
function NativeSelect({
  id,
  name,
  placeholder,
  defaultValue,
  children,
  ...rest
}: {
  id: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
  children: React.ReactNode;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      className="min-h-[48px] w-full border border-hairline bg-ground-2 px-4 text-body text-ink focus:border-accent focus:outline-none"
      {...rest}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {children}
    </select>
  );
}
