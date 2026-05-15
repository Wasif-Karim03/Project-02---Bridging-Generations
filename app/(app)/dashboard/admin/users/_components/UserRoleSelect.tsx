"use client";

import { useTransition } from "react";
import { setUserRoleAction } from "../actions";

type Role = "donor" | "mentor" | "admin" | "it" | "student";
const ROLES: Role[] = ["donor", "mentor", "admin", "it", "student"];

type Props = {
  userId: string;
  current: Role;
};

// Compact role picker per user row. Calls the server action; the page
// revalidates on success so the list re-renders with the new role.
export function UserRoleSelect({ userId, current }: Props) {
  const [pending, startTransition] = useTransition();
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Role;
    if (next === current) return;
    startTransition(async () => {
      await setUserRoleAction(userId, next);
    });
  }
  return (
    <select
      value={current}
      onChange={onChange}
      disabled={pending}
      className="h-9 border border-hairline bg-ground-2 px-2 text-body-sm text-ink focus:border-accent focus:outline-none disabled:opacity-60"
      aria-label={`Role for ${userId}`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
