"use client";

import { type AudienceValue, CONTACT_AUDIENCES } from "../actions.types";

const AUDIENCE_LABELS: Partial<Record<AudienceValue, string>> = {
  donor: "Donor",
  partner: "Partner",
  journalist: "Journalist",
  parent: "Parent",
};

const AUDIENCE_HINTS: Partial<Record<AudienceValue, string>> = {
  donor: "Questions about giving, recurring sponsorships, receipts.",
  partner: "Schools, NGOs, foundations exploring collaboration.",
  journalist: "Press, interview requests, photo permissions.",
  parent: "Family of a current or prospective student.",
};

type AudienceTriageProps = {
  name: string;
  defaultValue?: AudienceValue;
  legend?: string;
  error?: string;
};

export function AudienceTriage({
  name,
  defaultValue,
  legend = "I'm a…",
  error,
}: AudienceTriageProps) {
  const errorId = `audience-${name}-error`;

  return (
    <fieldset className="flex flex-col gap-3" aria-describedby={error ? errorId : undefined}>
      <legend className="text-body-sm font-medium text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {CONTACT_AUDIENCES.map((option) => (
          <label
            key={option}
            title={AUDIENCE_HINTS[option]}
            className="group inline-flex min-h-[48px] cursor-pointer items-center border border-hairline px-4 py-2 text-body text-ink-2 transition hover:border-accent has-[input:checked]:border-accent has-[input:checked]:bg-accent has-[input:checked]:text-white has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-[3px] has-[input:focus-visible]:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={option}
              defaultChecked={defaultValue === option}
              className="sr-only"
            />
            <span>{AUDIENCE_LABELS[option]}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-meta text-accent-2-text">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
