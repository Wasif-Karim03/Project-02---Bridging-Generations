"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { recordManualDonationAction } from "../actions";

const METHODS = ["Bank transfer", "Cash", "Cheque", "Mobile money (bKash)", "In-kind", "Other"];

export function NewDonationForm() {
  const [state, formAction, pending] = useActionState(recordManualDonationAction, null);
  const error = state && state.ok === false ? state.error : null;

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
        <Field label="Donor name" hint="As you'd record it in the books.">
          {(p) => <Input {...p} name="donorName" autoComplete="name" />}
        </Field>
        <Field label="Donor email" hint="Optional — for receipts / future attribution.">
          {(p) => <Input {...p} name="donorEmail" type="email" autoComplete="email" />}
        </Field>
        <Field label="Amount (USD)" hint="Numeric. Currency conversion happens before entry.">
          {(p) => <Input {...p} name="amountUsd" type="number" step="0.01" min="0.01" required />}
        </Field>
        <Field label="Gift date">
          {(p) => <Input {...p} name="occurredAt" type="date" required />}
        </Field>
        <Field label="Method">
          {(p) => (
            <select
              {...p}
              name="method"
              required
              defaultValue=""
              className="border border-hairline bg-ground-2 px-4 py-3 text-body text-ink focus:border-accent focus:outline-none aria-invalid:border-accent-2"
            >
              <option value="" disabled>
                Pick a method
              </option>
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Student slug" hint="Optional. The Keystatic student receiving the funds.">
          {(p) => <Input {...p} name="studentSlug" placeholder="e.g. adhara-barua" />}
        </Field>
        <Field label="Project slug" hint="Optional. Use if the gift is project-restricted.">
          {(p) => <Input {...p} name="projectSlug" placeholder="e.g. winter-uniforms" />}
        </Field>
      </div>
      <Field label="Notes" hint="Optional. Cheque number, dedication, any reconciling info.">
        {(p) => <Textarea {...p} name="notes" rows={4} maxLength={2000} />}
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save entry"}
        </button>
        <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
          Reflected in the ledger + summary immediately.
        </p>
      </div>
    </form>
  );
}
