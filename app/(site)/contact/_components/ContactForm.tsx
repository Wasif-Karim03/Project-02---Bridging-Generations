"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitContactForm } from "../actions";
import { type ContactActionState, initialContactState } from "../actions.types";
import { AudienceTriage } from "./AudienceTriage";

function SubmitButton({
  pending,
  sendingLabel,
  sendLabel,
}: {
  pending: boolean;
  sendingLabel: string;
  sendLabel: string;
}) {
  return (
    <Button type="submit" variant="primary" disabled={pending} className="min-h-[48px]">
      {pending ? sendingLabel : sendLabel}
    </Button>
  );
}

export function ContactForm() {
  const tx = useTranslations("contactPageExtra");
  const [state, formAction, pending] = useActionState<ContactActionState, FormData>(
    submitContactForm,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-3 bg-ground-2 p-8">
        <h2 className="text-heading-4 text-ink">{tx("formThankYou")}</h2>
        <p className="text-body text-ink-2">{state.message}</p>
        {state.submittedEmail ? (
          <p className="text-meta text-ink-2">
            Reply will go to <span className="text-ink">{state.submittedEmail}</span>.
          </p>
        ) : null}
      </div>
    );
  }

  const fieldErrors = state.fieldErrors ?? {};
  const errorKeys = Object.keys(fieldErrors);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5" aria-busy={pending}>
      {state.status === "error" ? (
        <div role="alert" className="flex flex-col gap-2 border border-accent-2 p-4 text-body">
          <p className="text-ink">{state.message}</p>
          {errorKeys.length > 0 ? (
            <ul className="list-disc pl-6 text-ink-2">
              {errorKeys.map((k) => {
                const label = k === "name" ? "Name" : k === "email" ? "Email" : "Message";
                return (
                  <li key={k}>
                    {label}: {fieldErrors[k as keyof typeof fieldErrors]}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      ) : null}

      <AudienceTriage name="audience" error={fieldErrors.audience} />

      <Field label={tx("formName")} error={fieldErrors.name}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="name"
            type="text"
            placeholder={tx("formNamePlaceholder")}
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            required
            maxLength={100}
          />
        )}
      </Field>

      <Field label={tx("formEmail")} error={fieldErrors.email}>
        {(fieldProps) => (
          <Input
            {...fieldProps}
            name="email"
            type="email"
            placeholder={tx("formEmailPlaceholder")}
            autoComplete="email"
            inputMode="email"
            autoCorrect="off"
            autoCapitalize="off"
            enterKeyHint="next"
            required
          />
        )}
      </Field>

      <Field label={tx("formMessage")} error={fieldErrors.message}>
        {(fieldProps) => (
          <Textarea
            {...fieldProps}
            name="message"
            rows={6}
            maxLength={2000}
            enterKeyHint="send"
            autoCapitalize="sentences"
            required
          />
        )}
      </Field>

      {/* Honeypot — hidden from real users, filled by bots.
          `sr-only` removes it from layout (clip: rect(0,0,0,0)) so the
          -9999px offset that used to inflate document.scrollWidth is gone. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="contact-company">
          Company
          <input
            id="contact-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <p className="text-meta text-ink-2">{tx("privacyNotice")}</p>

      <SubmitButton pending={pending} sendingLabel={tx("formSending")} sendLabel={tx("formSend")} />
    </form>
  );
}
