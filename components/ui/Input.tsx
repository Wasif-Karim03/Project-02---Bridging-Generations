import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const base =
  "border border-hairline bg-ground-2 px-4 py-3 text-body text-ink placeholder:text-ink-2 placeholder:opacity-70 focus:border-accent focus:outline-none aria-invalid:border-accent-2 disabled:cursor-not-allowed disabled:opacity-60";

export function Input({ className, ...rest }: InputProps) {
  return <input className={`${base}${className ? ` ${className}` : ""}`} {...rest} />;
}
