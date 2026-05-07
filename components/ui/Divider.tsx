type DividerSpacing = "none" | "sm" | "md" | "lg";

type DividerProps = {
  className?: string;
  spacing?: DividerSpacing;
};

const spacingMap: Record<DividerSpacing, string> = {
  none: "",
  sm: "my-4",
  md: "my-8",
  lg: "my-12",
};

export function Divider({ className, spacing = "none" }: DividerProps) {
  const classes = `border-0 border-t border-hairline ${spacingMap[spacing]}${
    className ? ` ${className}` : ""
  }`.trim();
  return <hr className={classes} />;
}
