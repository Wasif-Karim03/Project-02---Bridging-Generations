"use client";

import { useState, useTransition } from "react";
import { adminLinkStudentSlugAction } from "../actions";

type Props = {
  userId: string;
  currentSlug: string | null;
  slugOptions: { slug: string; label: string }[];
};

export function StudentSlugLink({ userId, currentSlug, slugOptions }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await adminLinkStudentSlugAction(userId, formData);
      setMessage(result.ok ? { kind: "ok", text: "Linked." } : { kind: "err", text: result.error });
    });
  }

  return (
    <form action={onSubmit} className="flex flex-wrap items-center gap-2">
      <select
        name="studentSlug"
        defaultValue={currentSlug ?? ""}
        disabled={pending}
        className="min-h-[34px] min-w-[200px] border border-hairline bg-ground px-2 text-body-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <option value="">Not linked</option>
        {slugOptions.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[34px] items-center border border-accent bg-accent px-3 text-meta uppercase text-white hover:bg-accent/90 disabled:opacity-50"
      >
        {pending ? "…" : "Save"}
      </button>
      {message ? (
        <span
          role={message.kind === "err" ? "alert" : "status"}
          className={
            message.kind === "ok"
              ? "text-meta uppercase tracking-[0.06em] text-accent"
              : "text-meta uppercase tracking-[0.06em] text-accent-2-text"
          }
        >
          {message.text}
        </span>
      ) : null}
    </form>
  );
}
