"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { submitContactForm } from "../../../contact/actions";
import { type ContactActionState, initialContactState } from "../../../contact/actions.types";

export function SubscribeForm() {
  const [state, formAction, pending] = useActionState<ContactActionState, FormData>(
    submitContactForm,
    initialContactState,
  );

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col gap-2 border-t border-hairline pt-5"
      >
        <p className="text-meta uppercase tracking-[0.08em] text-accent">Subscribed</p>
        <p className="text-body text-ink-2">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pending}
      className="flex flex-col gap-4 border-t border-hairline pt-5 sm:flex-row sm:items-end sm:gap-4"
    >
      <input type="hidden" name="audience" value="subscriber" />
      <div className="flex-1">
        <Field label="Email address" error={state.fieldErrors?.email}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          )}
        </Field>
      </div>
      {/* Honeypot — hidden from real users, filled by bots. */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="subscribe-company">
          Company
          <input
            id="subscribe-company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>
      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Sending…" : "Send"}
      </Button>
      {state.status === "error" && !state.fieldErrors?.email ? (
        <p role="alert" className="basis-full text-meta text-accent-2-text">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
