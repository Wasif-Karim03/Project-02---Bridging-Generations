"use client";

import { useMemo, useState } from "react";
import type { User } from "@/db/schema";
import { UserRoleSelect } from "./UserRoleSelect";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

type Props = {
  users: User[];
};

/** Client-side filter over the full users list. The list is bounded by the
 * org's scale (well under 1k accounts) so we don't need server-side search —
 * a simple substring match against email + displayName is fast and survives
 * pagination concerns we don't have yet. */
export function UsersTableWithSearch({ users }: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const visible = useMemo(() => {
    if (!trimmed) return users;
    return users.filter((u) => {
      const email = u.email.toLowerCase();
      const name = (u.displayName ?? "").toLowerCase();
      return email.includes(trimmed) || name.includes(trimmed);
    });
  }, [users, trimmed]);

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Search</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Email or display name…"
          className="min-h-[40px] border border-hairline bg-ground px-3 py-2 text-body text-ink focus:border-accent focus:outline-none"
        />
      </label>

      <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
        {visible.length} of {users.length} {trimmed ? "(filtered)" : "total"}
      </p>

      {visible.length === 0 ? (
        <p className="border border-hairline bg-ground-2 px-4 py-6 text-body text-ink-2">
          No accounts match <code>{query}</code>.
        </p>
      ) : (
        <>
          {/* DESKTOP — full table from sm and up. */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-body-sm">
              <thead>
                <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
                  <th className="py-3 pr-4 text-left">Email</th>
                  <th className="py-3 pr-4 text-left">Display name</th>
                  <th className="py-3 pr-4 text-left">Clerk ID</th>
                  <th className="py-3 pr-4 text-left">Joined</th>
                  <th className="py-3 text-right">Role</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((u) => (
                  <tr key={u.id} className="border-b border-hairline last:border-b-0">
                    <td className="py-3 pr-4 align-top text-ink">{u.email}</td>
                    <td className="py-3 pr-4 align-top text-ink-2">{u.displayName ?? "—"}</td>
                    <td className="py-3 pr-4 align-top font-mono text-meta text-ink-2">
                      {u.clerkUserId.slice(0, 12)}…
                    </td>
                    <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                      <time dateTime={u.createdAt.toISOString()}>
                        {dateFormatter.format(u.createdAt)}
                      </time>
                    </td>
                    <td className="py-3 text-right align-top">
                      {u.role === "anonymous" ? (
                        <span className="text-meta uppercase tracking-[0.06em] text-accent-2-text">
                          Pending sync
                        </span>
                      ) : (
                        <UserRoleSelect userId={u.id} current={u.role} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE — card list under sm breakpoint. */}
          <ul className="flex flex-col gap-3 sm:hidden">
            {visible.map((u) => (
              <li key={u.id} className="flex flex-col gap-2 border border-hairline bg-ground-2 p-4">
                <p className="text-body-sm text-ink">{u.email}</p>
                {u.displayName ? <p className="text-body-sm text-ink-2">{u.displayName}</p> : null}
                <p className="font-mono text-meta uppercase tracking-[0.06em] text-ink-2">
                  {u.clerkUserId.slice(0, 12)}… ·{" "}
                  <time dateTime={u.createdAt.toISOString()}>
                    {dateFormatter.format(u.createdAt)}
                  </time>
                </p>
                <div className="mt-1">
                  {u.role === "anonymous" ? (
                    <span className="text-meta uppercase tracking-[0.06em] text-accent-2-text">
                      Pending sync
                    </span>
                  ) : (
                    <UserRoleSelect userId={u.id} current={u.role} />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
