import type { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

const base =
  "appearance-none border border-hairline bg-ground-2 px-4 py-3 pr-10 text-body text-ink focus:border-accent focus:outline-none aria-invalid:border-accent-2 disabled:cursor-not-allowed disabled:opacity-60";

export function Select({ className, ...rest }: SelectProps) {
  return <select className={`${base}${className ? ` ${className}` : ""}`} {...rest} />;
}
