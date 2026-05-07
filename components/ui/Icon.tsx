import type { LucideIcon, LucideProps } from "lucide-react";

type IconProps = Omit<LucideProps, "ref"> & {
  icon: LucideIcon;
  /** When set, icon is informational and exposed via role="img" + aria-label. Otherwise decorative. */
  label?: string;
};

const DEFAULT_SIZE = 20;
const DEFAULT_STROKE = 1.75;

export function Icon({
  icon: LucideIconComponent,
  label,
  size = DEFAULT_SIZE,
  strokeWidth = DEFAULT_STROKE,
  ...rest
}: IconProps) {
  if (label) {
    return (
      <LucideIconComponent
        role="img"
        aria-label={label}
        size={size}
        strokeWidth={strokeWidth}
        {...rest}
      />
    );
  }
  return <LucideIconComponent aria-hidden="true" size={size} strokeWidth={strokeWidth} {...rest} />;
}
