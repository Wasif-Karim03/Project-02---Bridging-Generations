"use client";

export type FilterChipOption<V extends string = string> = {
  value: V;
  label: string;
  count?: number;
};

type FilterChipsProps<V extends string = string> = {
  options: FilterChipOption<V>[];
  value: V;
  onChange: (value: V) => void;
  ariaLabel: string;
  className?: string;
};

export function FilterChips<V extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: FilterChipsProps<V>) {
  const containerClass = `flex flex-wrap gap-2 border-0 p-0${className ? ` ${className}` : ""}`;
  return (
    <fieldset className={containerClass}>
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((option) => {
        const selected = option.value === value;
        const label =
          typeof option.count === "number" ? `${option.label} (${option.count})` : option.label;
        const base =
          "inline-flex min-h-[44px] items-center gap-1 border border-hairline px-4 py-2 text-body-sm transition focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent";
        const tone = selected ? "bg-accent text-white" : "bg-ground text-ink-2 hover:text-accent";
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`${base} ${tone}`}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
