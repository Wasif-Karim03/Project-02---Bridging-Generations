"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { addMediaItemAction } from "../actions";

export function AddItemForm({ folderId }: { folderId: string }) {
  const action = addMediaItemAction.bind(null, folderId);
  const [state, formAction, pending] = useActionState(action, null);
  const error = state && state.ok === false ? state.error : null;
  const success = state?.ok === true;

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 border border-hairline bg-ground-2 p-5"
    >
      <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Add item</p>
      {error ? (
        <p
          role="alert"
          aria-live="polite"
          className="border border-accent-2-text bg-accent-2-text/10 px-4 py-3 text-body-sm text-accent-2-text"
        >
          {error}
        </p>
      ) : null}
      {success ? (
        <p
          role="status"
          className="border border-accent bg-accent/5 px-4 py-3 text-body-sm text-accent"
        >
          Saved. Add another below or scroll down to see it in the list.
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
        <Field label="URL" hint="Direct link to an image, Drive folder, or external page.">
          {(p) => <Input {...p} name="url" type="url" placeholder="https://..." required />}
        </Field>
        <Field label="Kind">
          {(p) => (
            <select
              {...p}
              name="kind"
              defaultValue="image"
              className="border border-hairline bg-ground-2 px-4 py-3 text-body text-ink focus:border-accent focus:outline-none"
            >
              <option value="image">Image</option>
              <option value="link">Link</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
          )}
        </Field>
      </div>
      <Field label="Title" hint="Optional. Shows above the item in the list.">
        {(p) => <Input {...p} name="title" />}
      </Field>
      <Field label="Caption" hint="Optional. A few sentences of context.">
        {(p) => <Textarea {...p} name="caption" rows={3} />}
      </Field>
      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add item"}
        </button>
      </div>
      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        Direct file uploads aren't supported yet — paste a Drive / Cloudinary URL for now.
      </p>
    </form>
  );
}
