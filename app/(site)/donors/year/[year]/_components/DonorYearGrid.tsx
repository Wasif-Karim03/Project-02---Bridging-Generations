"use client";

import { useState } from "react";
import { DonorYearCard } from "./DonorYearCard";

export type DonorYearItem = {
  id: string;
  displayName: string;
  photoUrl: string | null;
  country: string | null;
  totalDonated: number;
};

type DonorYearGridProps = {
  items: DonorYearItem[];
};

export function DonorYearGrid({ items }: DonorYearGridProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? items.filter((item) =>
        item.displayName.toLowerCase().includes(query.toLowerCase()),
      )
    : items;

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-sm">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search donors by name…"
          aria-label="Search donors"
          className="w-full border border-hairline bg-ground-2 px-4 py-2.5 text-body-sm text-ink placeholder:text-ink-3 focus:outline-2 focus:outline-offset-[3px] focus:outline-accent"
        />
      </div>

      <p className="text-meta uppercase tracking-[0.08em] text-ink-2">
        Showing {filtered.length} of {items.length} donors
      </p>

      {filtered.length > 0 ? (
        <ul
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
        >
          {filtered.map((item) => (
            <li key={item.id}>
              <DonorYearCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-body-sm text-ink-2">
          No donors found matching &ldquo;{query}&rdquo;.
        </p>
      )}
    </div>
  );
}
