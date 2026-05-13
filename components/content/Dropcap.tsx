import type { ReactNode } from "react";

type DropcapProps = {
  children: ReactNode;
};

export function Dropcap({ children }: DropcapProps) {
  return <div className="dropcap">{children}</div>;
}
