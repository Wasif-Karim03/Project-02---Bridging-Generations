import type { ReactNode } from "react";
import { StatusDot } from "./StatusDot";

type TagPillProps = {
  children: ReactNode;
  variant?: "default" | "live" | "stamp";
  statusVariant?: "active" | "pending";
  className?: string;
};

export function TagPill({
  children,
  variant = "default",
  statusVariant = "active",
  className,
}: TagPillProps) {
  const base =
    variant === "stamp"
      ? "inline-flex items-center gap-2 rounded-sm border border-current bg-transparent px-3 py-1 text-eyebrow uppercase text-accent-2-text"
      : "inline-flex items-center gap-2 rounded-full px-3 py-1 text-eyebrow uppercase";
  const variantClass =
    variant === "stamp"
      ? ""
      : variant === "live"
        ? "bg-ground-2 text-accent"
        : "bg-ground-3 text-accent";
  return (
    <span className={`${base} ${variantClass}${className ? ` ${className}` : ""}`.trim()}>
      {variant === "live" ? <StatusDot variant={statusVariant} /> : null}
      {children}
    </span>
  );
}
