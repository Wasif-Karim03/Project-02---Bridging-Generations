"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { submitGiveForm } from "../actions";
import { type GiveActionState, initialGiveState } from "../actions.types";
import { ProfilePreviewCard } from "./ProfilePreviewCard";
import { ProfilePrivacyToggle } from "./ProfilePrivacyToggle";

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <Button type="submit" variant="primary" disabled={pending} className="min-h-[48px]">
      {pending ? "Submitting…" : "Create profile & continue to donate"}
    </Button>
  );
}

export function DonorProfileForm() {
  const [state, formAction, pending] = useActionState<GiveActionState, FormData>(
    submitGiveForm,
    initialGiveState,
  );

  const [name, setName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [visibility, setVisibility] = useState<"public" | "anonymous">("public");

  if (state.status === "success") {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-4 bg-ground-2 p-8">
        <h2 className="text-heading-4 text-ink">Profile submitted.</h2>
        <p className="text-body text-ink-2">{state.message}</p>
        <p className="text-body text-ink-2">You can now complete your donation below.</p>
        <Button variant="primary" href="/donate">
          Continue to donate
        </Button>
      </div>
    );
  }

  const fieldErrors = state.fieldErrors ?? {};
  const errorKeys = Object.keys(fieldErrors);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
      <form action={formAction} noValidate className="flex flex-col gap-5" aria-busy={pending}>
        {state.status === "error" ? (
          <div role="alert" className="flex flex-col gap-2 border border-accent-2 p-4 text-body">
            <p className="text-ink">{state.message}</p>
            {errorKeys.length > 0 ? (
              <ul className="list-disc pl-6 text-ink-2">
                {errorKeys.map((k) => (
                  <li key={k}>{fieldErrors[k as keyof typeof fieldErrors]}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <ProfilePrivacyToggle value={visibility} onChange={setVisibility} />

        {/* Hidden input keeps server action in sync with controlled radio state */}
        <input type="hidden" name="visibility" value={visibility} />

        {visibility === "public" ? (
          <Field label="Your name" error={fieldErrors.name}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                name="name"
                type="text"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
          </Field>
        ) : null}

        <Field
          label="Your email"
          hint="Internal only — never shown publicly."
          error={fieldErrors.email}
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCorrect="off"
              autoCapitalize="off"
              enterKeyHint="next"
              required
            />
          )}
        </Field>

        <Field
          label="Link to a photo — optional"
          hint="Paste a public image URL. Admin adds it to your profile."
          error={fieldErrors.photoUrl}
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              name="photoUrl"
              type="url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              enterKeyHint="next"
              placeholder="https://…"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
            />
          )}
        </Field>

        <Field
          label="A short public message — optional"
          hint="Up to 300 characters. Shown on your public donor page."
          error={fieldErrors.message}
        >
          {(fieldProps) => (
            <Textarea
              {...fieldProps}
              name="message"
              rows={4}
              maxLength={300}
              enterKeyHint="send"
              autoCapitalize="sentences"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          )}
        </Field>

        {/* Honeypot */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor="give-company">
            Company
            <input
              id="give-company"
              name="company"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              defaultValue=""
            />
          </label>
        </div>

        <p className="text-meta text-ink-2">
          Your email is only used to link this profile to your donation. We will not add you to any
          mailing list.
        </p>

        <SubmitButton pending={pending} />

        <p className="text-meta text-ink-2">
          Prefer to donate without a profile?{" "}
          <a href="/donate" className="underline hover:text-ink">
            Skip and donate directly.
          </a>
        </p>
      </form>

      <div className="lg:pt-2">
        <ProfilePreviewCard
          name={name}
          photoUrl={photoUrl}
          message={message}
          isAnonymous={visibility === "anonymous"}
        />
      </div>
    </div>
  );
}
