"use client";

import { useState } from "react";

type StripeDonateFormProps = {
  /** Preset amount buttons (USD). */
  suggestedAmounts: number[];
  /** Default selection — typically the monthlySuggestion. */
  defaultAmount: number;
  /** Pre-selected project slug, if /donate?project=foo is in the URL. */
  preselectedProjectId?: string;
  /** Pre-selected student slug, if /donate?student=foo is in the URL. */
  preselectedStudentId?: string;
  /** When false (env not set), the form shows a "donations not yet available" panel. */
  stripeConfigured: boolean;
  /** Mailto-fallback email for the not-configured / error states. */
  fallbackEmail: string;
};

export function StripeDonateForm({
  suggestedAmounts,
  defaultAmount,
  preselectedProjectId,
  preselectedStudentId,
  stripeConfigured,
  fallbackEmail,
}: StripeDonateFormProps) {
  const [recurring, setRecurring] = useState(true);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [dedicationText, setDedicationText] = useState<string>("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function effectiveAmount(): number {
    if (customAmount.trim()) {
      const n = Number(customAmount);
      return Number.isFinite(n) ? n : 0;
    }
    return amount;
  }

  if (!stripeConfigured) {
    return (
      <div className="border border-hairline bg-ground-2 p-6 text-body text-ink">
        <p className="text-heading-5 text-ink">Donations are temporarily by email.</p>
        <p className="mt-2 text-body-sm text-ink-2">
          Our Stripe checkout is being set up. In the meantime, email{" "}
          <a
            href={`mailto:${fallbackEmail}?subject=I%27d%20like%20to%20donate`}
            className="text-accent underline underline-offset-[3px] hover:no-underline"
          >
            {fallbackEmail}
          </a>{" "}
          and the board will confirm and route your gift personally.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = effectiveAmount();
    if (!Number.isFinite(amt) || amt < 5) {
      setError("Please enter a donation amount of at least $5.");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: amt,
          recurring,
          projectId: preselectedProjectId ?? "",
          studentId: preselectedStudentId ?? "",
          dedicationText: dedicationText.trim(),
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          payload.error ?? `Donation server returned ${res.status}. Please try again.`,
        );
      }
      const data = (await res.json()) as { url?: string };
      if (!data.url) throw new Error("No checkout URL returned.");
      window.location.assign(data.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start checkout.";
      setError(message);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6 border border-hairline bg-ground-2 p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      {/* Recurring vs one-time */}
      <div role="tablist" aria-label="Donation frequency" className="grid grid-cols-2 gap-0">
        <button
          type="button"
          role="tab"
          aria-selected={recurring}
          onClick={() => setRecurring(true)}
          className={
            recurring
              ? "min-h-[44px] bg-accent px-4 text-nav-link uppercase text-white"
              : "min-h-[44px] border border-hairline bg-ground-2 px-4 text-nav-link uppercase text-ink-2 hover:border-accent hover:text-accent"
          }
        >
          Monthly
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!recurring}
          onClick={() => setRecurring(false)}
          className={
            !recurring
              ? "min-h-[44px] bg-accent px-4 text-nav-link uppercase text-white"
              : "min-h-[44px] border border-hairline bg-ground-2 px-4 text-nav-link uppercase text-ink-2 hover:border-accent hover:text-accent"
          }
        >
          One-time
        </button>
      </div>

      {/* Amount picker */}
      <fieldset>
        <legend className="text-meta uppercase tracking-[0.08em] text-ink-2">Amount (USD)</legend>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {suggestedAmounts.map((preset) => {
            const isActive = amount === preset && !customAmount.trim();
            return (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  setAmount(preset);
                  setCustomAmount("");
                }}
                aria-pressed={isActive}
                className={
                  isActive
                    ? "h-12 bg-accent px-3 text-body-sm font-bold text-white"
                    : "h-12 border border-hairline bg-ground-2 px-3 text-body-sm text-ink-2 hover:border-accent hover:text-accent"
                }
              >
                ${preset}
              </button>
            );
          })}
        </div>
        <label className="mt-3 flex items-center gap-2 text-body-sm text-ink-2">
          <span>or custom</span>
          <span className="inline-flex items-center">
            <span aria-hidden="true" className="mr-1 text-ink-2">
              $
            </span>
            <input
              type="number"
              inputMode="numeric"
              min={5}
              max={10000}
              step={1}
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0"
              className="h-10 w-24 border border-hairline bg-ground-2 px-2 text-body text-ink focus:border-accent focus:outline-none"
              aria-label="Custom donation amount (USD)"
            />
          </span>
          {recurring ? <span className="text-meta text-ink-2">/ month</span> : null}
        </label>
      </fieldset>

      {/* Dedication (optional) */}
      <label className="flex flex-col gap-2">
        <span className="text-meta uppercase tracking-[0.08em] text-ink-2">
          Dedication (optional)
        </span>
        <input
          type="text"
          value={dedicationText}
          onChange={(e) => setDedicationText(e.target.value)}
          maxLength={280}
          placeholder="In memory of… / In honour of…"
          className="h-11 border border-hairline bg-ground-2 px-3 text-body text-ink focus:border-accent focus:outline-none"
        />
      </label>

      {/* Pre-selected target indicator */}
      {(preselectedProjectId || preselectedStudentId) && (
        <p className="text-meta uppercase tracking-[0.06em] text-accent">
          {preselectedProjectId
            ? `This gift is dedicated to project: ${preselectedProjectId}`
            : `This gift is dedicated to student: ${preselectedStudentId}`}
        </p>
      )}

      {error ? (
        <p role="alert" className="text-body-sm text-accent-2-text">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[52px] items-center justify-center bg-accent-2 px-6 text-[17px] font-bold text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? "Redirecting to Stripe…"
          : `Give $${effectiveAmount() || 0}${recurring ? " / month" : ""}`}
      </button>
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Secure checkout by Stripe · 501(c)(3) · tax-deductible
      </p>
    </form>
  );
}
