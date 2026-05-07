import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
};

export function Eyebrow({ children, className, as: Tag = "p" }: EyebrowProps) {
  return (
    <Tag className={`text-eyebrow uppercase text-accent${className ? ` ${className}` : ""}`}>
      {children}
    </Tag>
  );
}
