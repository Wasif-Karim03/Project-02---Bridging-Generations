import type { ReactNode } from "react";

type MarginaliaProps = {
  children: ReactNode;
  position?: "left" | "right";
};

export function Marginalia({ children, position = "right" }: MarginaliaProps) {
  return (
    <aside className="marginalia" data-position={position}>
      {children}
    </aside>
  );
}
