import { type ReactNode, useId } from "react";

type FieldChildArgs = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (args: FieldChildArgs) => ReactNode;
};

export function Field({ label, hint, error, children }: FieldProps) {
  const reactId = useId();
  const id = `field-${reactId}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  const childArgs: FieldChildArgs = {
    id,
    "aria-describedby": describedBy.length > 0 ? describedBy : undefined,
    "aria-invalid": error ? true : undefined,
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-body-sm font-medium text-ink">
        {label}
      </label>
      {children(childArgs)}
      {error ? (
        <p id={errorId} role="alert" aria-live="polite" className="text-meta text-accent-2-text">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-meta text-ink-2">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
