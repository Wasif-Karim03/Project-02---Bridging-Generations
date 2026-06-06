"use client";

import { useActionState, useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { type StudentApplicationState, submitStudentApplicationAction } from "../actions";

// Income + ethnicity options carry an English `value` (what we store, so the
// admin views + exports stay stable) and a bilingual `label` shown to the
// student. Keeping the value English means switching the visible language never
// changes the saved data.
const FAMILY_INCOME_OPTIONS = [
  { value: "Under 5,000 BDT / month", label: "Under 5,000 BDT / month (৫,০০০ টাকার নিচে / মাস)" },
  {
    value: "5,000 — 10,000 BDT / month",
    label: "5,000 — 10,000 BDT / month (৫,০০০ — ১০,০০০ টাকা / মাস)",
  },
  {
    value: "10,000 — 20,000 BDT / month",
    label: "10,000 — 20,000 BDT / month (১০,০০০ — ২০,০০০ টাকা / মাস)",
  },
  {
    value: "20,000 — 40,000 BDT / month",
    label: "20,000 — 40,000 BDT / month (২০,০০০ — ৪০,০০০ টাকা / মাস)",
  },
  { value: "Over 40,000 BDT / month", label: "Over 40,000 BDT / month (৪০,০০০ টাকার বেশি / মাস)" },
  { value: "Prefer not to say", label: "Prefer not to say (বলতে চাই না)" },
] as const;

const ETHNICITY_OPTIONS = [
  { value: "Chakma", label: "Chakma (চাকমা)" },
  { value: "Marma", label: "Marma (মারমা)" },
  { value: "Tripura", label: "Tripura (ত্রিপুরা)" },
  { value: "Tanchangya", label: "Tanchangya (তঞ্চঙ্গ্যা)" },
  { value: "Mro", label: "Mro (ম্রো)" },
  { value: "Barua", label: "Barua (বড়ুয়া)" },
  { value: "Bengali", label: "Bengali (বাঙালি)" },
  { value: "Other", label: "Other (অন্যান্য)" },
  { value: "Prefer not to say", label: "Prefer not to say (বলতে চাই না)" },
] as const;

const SELECT_PLACEHOLDER = "Select… (নির্বাচন করুন…)";

// Mirrors the org's paper scholarship application form, section by section.
// Reuses the shared Field / Input / Textarea primitives so styling matches the
// rest of the site. Labels are shown in English with the Bangla in parentheses
// so the bilingual paper form carries over to the web. The passport photo is
// uploaded and stored privately in the database (never the public repo).
type SubmitAction = (
  prev: StudentApplicationState | null,
  formData: FormData,
) => Promise<StudentApplicationState>;

export function StudentApplicationForm({
  initialEmail,
  action = submitStudentApplicationAction,
  submitLabel = "Submit application (আবেদন জমা দিন)",
}: {
  initialEmail?: string;
  // Defaults to the student self-signup action; the mentor "Register Student"
  // flow passes its own action that creates a registration with no account.
  action?: SubmitAction;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<StudentApplicationState | null, FormData>(
    action,
    null,
  );
  // Per-installment + duration only apply when the student picks installments,
  // so we toggle those fields on this selection. Defaults to installments to
  // match the radio's defaultChecked below.
  const [amountNature, setAmountNature] = useState<"installments" | "one_time">("installments");

  return (
    <form action={formAction} className="flex flex-col gap-12">
      <FormSection
        index="01"
        title="Student details (শিক্ষার্থীর তথ্য)"
        subtitle="The student's own information, and a recent passport-style photo."
      >
        <Field
          label="Passport-style photo (শিক্ষার্থীর ছবি) *"
          hint="A clear head-and-shoulders photo. JPG, PNG, or WebP, up to 4MB. Kept private."
        >
          {(p) => (
            <input
              id={p.id}
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required
              className="block w-full text-body-sm text-ink file:mr-4 file:min-h-[44px] file:cursor-pointer file:border-0 file:bg-accent file:px-4 file:text-nav-link file:uppercase file:text-white"
            />
          )}
        </Field>
        <Field
          label="Full name (পূর্ণ নাম) *"
          hint="Your registration number is generated automatically once you submit."
        >
          {(p) => <Input {...p} name="studentName" autoComplete="name" required maxLength={120} />}
        </Field>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Gender (লিঙ্গ) *">
            {(p) => (
              <NativeSelect {...p} name="gender" placeholder={SELECT_PLACEHOLDER} required>
                <option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
                <option value="Other">Other (অন্যান্য)</option>
              </NativeSelect>
            )}
          </Field>
          <Field label="Date of birth (জন্ম তারিখ) *">
            {(p) => <Input {...p} name="dateOfBirth" type="date" required />}
          </Field>
          <Field label="An orphan? (এতিম?) *">
            {(p) => (
              <NativeSelect {...p} name="isOrphan" defaultValue="no" required>
                <option value="no">No (না)</option>
                <option value="yes">Yes (হ্যাঁ)</option>
              </NativeSelect>
            )}
          </Field>
        </div>
        <Field label="Ethnicity (নৃগোষ্ঠী) *">
          {(p) => (
            <NativeSelect {...p} name="ethnicity" placeholder={SELECT_PLACEHOLDER} required>
              {ETHNICITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
      </FormSection>

      <FormSection index="02" title="Parents (পিতা-মাতা)" subtitle="The student's mother and father.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Father's name (পিতার নাম) *">
            {(p) => <Input {...p} name="fatherName" required maxLength={120} />}
          </Field>
          <Field label="Mother's name (মাতার নাম) *">
            {(p) => <Input {...p} name="motherName" required maxLength={120} />}
          </Field>
        </div>
        <Field label="Contact (যোগাযোগ নম্বর) *" hint="A phone number to reach the parents.">
          {(p) => (
            <Input
              {...p}
              name="parentsContact"
              type="tel"
              inputMode="tel"
              required
              maxLength={40}
            />
          )}
        </Field>
      </FormSection>

      <FormSection index="03" title="Address (ঠিকানা)" subtitle="Where the student and family live.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Village / area (গ্রাম) *">
            {(p) => <Input {...p} name="village" required maxLength={200} />}
          </Field>
          <Field label="Post office (ডাকঘর) *">
            {(p) => <Input {...p} name="postOffice" required maxLength={160} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Police station / upazila (থানা) *">
            {(p) => <Input {...p} name="policeStation" required maxLength={160} />}
          </Field>
          <Field label="District (জেলা) *">
            {(p) => <Input {...p} name="district" required maxLength={120} />}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="04"
        title="Academic info (শিক্ষাগত তথ্য)"
        subtitle="The student's class and school."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Class (শ্রেণি) *" hint="e.g. 7, Class 8, HSC 1st year">
            {(p) => <Input {...p} name="grade" required maxLength={40} />}
          </Field>
          <Field label="School / institute (বিদ্যালয় / প্রতিষ্ঠান) *">
            {(p) => <Input {...p} name="school" required maxLength={200} />}
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Current roll no. (বর্তমান রোল নম্বর) *">
            {(p) => <Input {...p} name="currentRollNo" required maxLength={60} />}
          </Field>
          <Field
            label="Former roll no. (পূর্ববর্তী রোল নম্বর)"
            hint="Leave blank if you don't have one."
          >
            {(p) => <Input {...p} name="formerRollNo" maxLength={60} />}
          </Field>
          <Field label="Total students in class (মোট শিক্ষার্থী) *">
            {(p) => <Input {...p} name="totalStudents" required maxLength={40} />}
          </Field>
        </div>
      </FormSection>

      <FormSection
        index="05"
        title="Family & financial (পরিবার ও আর্থিক)"
        subtitle="The family's situation and what the student is asking for."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Father's profession (পিতার পেশা) *" hint="e.g. Day laborer, Un-employed">
            {(p) => <Input {...p} name="fatherProfession" required maxLength={160} />}
          </Field>
          <Field label="Mother's profession (মাতার পেশা) *" hint="e.g. House-wife">
            {(p) => <Input {...p} name="motherProfession" required maxLength={160} />}
          </Field>
        </div>
        <Field
          label="Family monthly income (পারিবারিক মাসিক আয়) *"
          hint="Pick a range, or type an amount below in Purpose."
        >
          {(p) => (
            <NativeSelect {...p} name="familyIncome" placeholder={SELECT_PLACEHOLDER} required>
              {FAMILY_INCOME_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
        <Field
          label="Purpose (উদ্দেশ্য) *"
          hint="What the support is for, and any income detail (e.g. 'Day labour, 3000/= per month')."
        >
          {(p) => <Textarea {...p} name="purpose" rows={2} required maxLength={2000} />}
        </Field>
        <Field label="Required amount (প্রয়োজনীয় অর্থ) *" hint="e.g. 2000/-">
          {(p) => <Input {...p} name="requiredAmount" required maxLength={60} />}
        </Field>
      </FormSection>

      <FormSection
        index="06"
        title="Amount nature (অর্থের ধরন)"
        subtitle="How the requested amount should be paid."
      >
        <Field label="Payment type (অর্থের ধরন) *">
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
                  checked={amountNature === "installments"}
                  onChange={() => setAmountNature("installments")}
                  className="size-4 accent-accent"
                />
                By installments (কিস্তিতে)
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="amountNature"
                  value="one_time"
                  checked={amountNature === "one_time"}
                  onChange={() => setAmountNature("one_time")}
                  className="size-4 accent-accent"
                />
                One time (এককালীন)
              </label>
            </div>
          )}
        </Field>
        {amountNature === "installments" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Per installment (প্রতি কিস্তির পরিমাণ) *" hint="Amount per installment.">
              {(p) => <Input {...p} name="perInstallment" required maxLength={60} />}
            </Field>
            <Field label="Duration (মেয়াদ) *">
              {(p) => (
                <div className="flex gap-3">
                  <Input {...p} name="durationValue" required maxLength={40} placeholder="e.g. 2" />
                  <NativeSelect id={`${p.id}-unit`} name="durationUnit" defaultValue="years">
                    <option value="years">years (বছর)</option>
                    <option value="months">months (মাস)</option>
                  </NativeSelect>
                </div>
              )}
            </Field>
          </div>
        ) : null}
      </FormSection>

      <FormSection
        index="07"
        title="Guardian (অভিভাবক)"
        subtitle="The guardian responsible for the student (if different from a parent)."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Guardian's name (অভিভাবকের নাম) *">
            {(p) => <Input {...p} name="guardianName" required maxLength={120} />}
          </Field>
          <Field label="Guardian's contact (অভিভাবকের যোগাযোগ নম্বর) *">
            {(p) => (
              <Input
                {...p}
                name="guardianPhone"
                type="tel"
                inputMode="tel"
                required
                maxLength={40}
              />
            )}
          </Field>
        </div>
        <Field label="Guardian's address (অভিভাবকের ঠিকানা) *">
          {(p) => <Textarea {...p} name="guardianAddress" rows={2} required maxLength={2000} />}
        </Field>
      </FormSection>

      <FormSection index="08" title="Other (অন্যান্য)" subtitle="Anything else the board should know.">
        <Field
          label="Comment (মন্তব্য)"
          hint="Optional — a short note about the student's situation."
        >
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
          <Field
            label="Student contact (শিক্ষার্থীর যোগাযোগ নম্বর) *"
            hint="A phone number to reach the student."
          >
            {(p) => (
              <Input {...p} name="phone" type="tel" inputMode="tel" required maxLength={40} />
            )}
          </Field>
          <Field label="Email (ইমেইল) *" hint="We'll use this to email your application status.">
            {(p) => (
              <Input
                {...p}
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                defaultValue={initialEmail}
                required
                maxLength={255}
              />
            )}
          </Field>
        </div>
        <label className="flex items-start gap-3 border border-hairline bg-ground-2 px-4 py-3 text-body-sm text-ink">
          <input
            type="checkbox"
            name="declaration"
            value="yes"
            required
            className="mt-0.5 size-4 shrink-0 accent-accent"
          />
          <span>
            I confirm that the information above is true and correct.
            <span className="mt-1 block text-ink-2">
              আমি নিশ্চিত করছি যে উপরের তথ্যগুলো সত্য ও সঠিক।
            </span>
          </span>
        </label>
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
        <p className="max-w-[52ch] text-meta uppercase tracking-[0.06em] text-ink-2">
          Fields marked * are required (★ চিহ্নিত ঘরগুলো আবশ্যক). We'll redirect you to sign in once
          you submit.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center justify-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Submitting…" : `${submitLabel} →`}
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
  required?: boolean;
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
