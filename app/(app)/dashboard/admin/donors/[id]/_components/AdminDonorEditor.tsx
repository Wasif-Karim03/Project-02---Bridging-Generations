"use client";

import { useState, useTransition } from "react";
import { adminSetDonorRoleAction, adminUpdateDonorProfileAction } from "../actions";

type Role = "anonymous" | "donor" | "mentor" | "admin" | "it";

type Props = {
  donorUserId: string;
  currentRole: Role;
  initial: {
    legalName: string;
    publicInitials: string;
    anonymous: boolean;
    dedicationText: string;
  };
};

export function AdminDonorEditor({ donorUserId, currentRole, initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function onProfileSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await adminUpdateDonorProfileAction(donorUserId, formData);
      setMessage(
        result.ok ? { kind: "ok", text: "Profile updated." } : { kind: "err", text: result.error },
      );
    });
  }

  function onRoleChange(role: Role) {
    setMessage(null);
    startTransition(async () => {
      const result = await adminSetDonorRoleAction(donorUserId, role);
      setMessage(
        result.ok
          ? { kind: "ok", text: `Role set to ${role}.` }
          : { kind: "err", text: result.error },
      );
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={onProfileSubmit} className="flex flex-col gap-4">
        <Field
          label="Legal name (private — never shown on /donors)"
          name="legalName"
          defaultValue={initial.legalName}
          maxLength={200}
        />
        <Field
          label="Public initials (shown if anonymous)"
          name="publicInitials"
          defaultValue={initial.publicInitials}
          placeholder="e.g. A.B."
          maxLength={8}
        />
        <Field
          label="Dedication line (optional, shown publicly when not anonymous)"
          name="dedicationText"
          defaultValue={initial.dedicationText}
          maxLength={280}
          multiline
        />
        <label className="inline-flex items-center gap-2 text-body text-ink">
          <input
            type="checkbox"
            name="anonymous"
            defaultChecked={initial.anonymous}
            className="size-4 border border-hairline"
          />
          Show as anonymous on /donors (initials only, never legal name)
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 border-t border-hairline pt-5">
        <p className="text-eyebrow uppercase tracking-[0.1em] text-accent">Role</p>
        <p className="text-body-sm text-ink-2">
          Promote, demote, or deactivate this account. Current role: <strong>{currentRole}</strong>.
        </p>
        <div className="flex flex-wrap gap-2">
          {(["donor", "mentor", "admin", "it", "anonymous"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRoleChange(r)}
              disabled={pending || r === currentRole}
              className={
                r === currentRole
                  ? "inline-flex min-h-[36px] items-center bg-accent px-3 text-meta uppercase text-white"
                  : "inline-flex min-h-[36px] items-center border border-hairline bg-ground-2 px-3 text-meta uppercase text-ink-2 hover:border-accent hover:text-accent disabled:opacity-50"
              }
            >
              {r === "anonymous" ? "Deactivate" : r}
            </button>
          ))}
        </div>
      </div>

      {message ? (
        <p
          role={message.kind === "err" ? "alert" : "status"}
          className={
            message.kind === "ok"
              ? "border border-accent bg-accent/10 px-4 py-2 text-body-sm text-ink"
              : "border border-accent-2-text bg-accent-2-text/10 px-4 py-2 text-body-sm text-accent-2-text"
          }
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  maxLength,
  multiline,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-meta uppercase tracking-[0.06em] text-ink-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className="border border-hairline bg-ground px-3 py-2 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      ) : (
        <input
          id={id}
          type="text"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={maxLength}
          className="min-h-[40px] border border-hairline bg-ground px-3 text-body text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      )}
    </div>
  );
}
