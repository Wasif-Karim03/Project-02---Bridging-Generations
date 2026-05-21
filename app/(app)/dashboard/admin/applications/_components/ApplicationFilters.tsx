"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { ApplicationRow, ApplicationStatus } from "@/lib/content/applicationsMock";
import { APPLICATION_KIND_LABEL, APPLICATION_STATUS_LABEL } from "@/lib/content/applicationsMock";

type Props = {
  statusFilter?: ApplicationStatus;
  kindFilter?: ApplicationRow["kind"];
};

const KIND_OPTIONS: ApplicationRow["kind"][] = ["scholarship", "mentor", "student-sponsorship"];
const STATUS_OPTIONS: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
];

/** Two URL-backed dropdowns for the applications list. We write filters to
 * searchParams (not local state) so the URL itself is the source of truth —
 * sharable, bookmarkable, survives refresh. router.push triggers a server
 * re-render of the page so the table re-queries automatically. */
export function ApplicationFilters({ statusFilter, kindFilter }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(name: "status" | "kind", value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/dashboard/admin/applications?${qs}` : "/dashboard/admin/applications");
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 border border-hairline bg-ground-2 px-4 py-3">
      <FilterSelect
        label="Status"
        value={statusFilter ?? ""}
        onChange={(v) => updateParam("status", v)}
        options={[
          ["", "All statuses"],
          ...STATUS_OPTIONS.map((s) => [s, APPLICATION_STATUS_LABEL[s]] as [string, string]),
        ]}
      />
      <FilterSelect
        label="Kind"
        value={kindFilter ?? ""}
        onChange={(v) => updateParam("kind", v)}
        options={[
          ["", "All kinds"],
          ...KIND_OPTIONS.map((k) => [k, APPLICATION_KIND_LABEL[k]] as [string, string]),
        ]}
      />
      {(statusFilter || kindFilter) && (
        <button
          type="button"
          onClick={() => {
            startTransition(() => {
              router.push("/dashboard/admin/applications");
            });
          }}
          className="min-h-[40px] border border-hairline px-3 text-meta uppercase tracking-[0.08em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
        >
          Clear filters
        </button>
      )}
      {isPending ? (
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2" role="status">
          Updating…
        </span>
      ) : null}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-meta uppercase tracking-[0.06em] text-ink-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[40px] border border-hairline bg-ground px-3 py-2 text-body text-ink focus:border-accent focus:outline-none"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
