type StatusDotProps = {
  variant?: "active" | "pending";
  label?: string;
  className?: string;
};

export function StatusDot({ variant = "active", label, className }: StatusDotProps) {
  const base = "inline-block size-2 rounded-full";
  const variantClass = variant === "active" ? "bg-accent-2" : "border border-ink-2 bg-transparent";
  const classes = `${base} ${variantClass}${className ? ` ${className}` : ""}`;
  if (label) {
    return <span role="img" aria-label={label} className={classes} />;
  }
  return <span aria-hidden="true" className={classes} />;
}
