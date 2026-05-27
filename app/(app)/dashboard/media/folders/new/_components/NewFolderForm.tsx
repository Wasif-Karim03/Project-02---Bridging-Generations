"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { createMediaFolderAction } from "../actions";

export function NewFolderForm() {
  const [state, formAction, pending] = useActionState(createMediaFolderAction, null);
  const error = state && state.ok === false ? state.error : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {error}
        </p>
      ) : null}
      <Field label="Folder name" hint="A short label — used in the listing.">
        {(p) => <Input {...p} name="name" required />}
      </Field>
      <Field label="Event name" hint="Optional, longer name if it differs from the folder label.">
        {(p) => <Input {...p} name="eventName" />}
      </Field>
      <Field label="Event date" hint="Optional. Helps sort folders chronologically.">
        {(p) => <Input {...p} name="eventDate" type="date" />}
      </Field>
      <Field label="Description" hint="Optional. Context an admin or future-you would want.">
        {(p) => <Textarea {...p} name="description" rows={4} />}
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[48px] items-center bg-accent px-6 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create folder"}
        </button>
      </div>
    </form>
  );
}
