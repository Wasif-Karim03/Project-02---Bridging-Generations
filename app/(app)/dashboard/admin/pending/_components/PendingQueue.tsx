"use client";

import { useMemo, useState, useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { bulkApprovePendingSignupsAction, bulkRejectPendingSignupsAction } from "../actions";
import { PendingActions } from "./PendingActions";

type Row = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  createdAt: Date;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

// Pending-signups queue with row selection + bulk approve/reject.
// Responsive: full table at `sm` and up, stacked cards on mobile.
//
// Bulk-reject opens an inline shared-reason textarea that applies the
// same rejection note to every selected row — matches the per-row
// PendingActions flow (which also asks for an optional reason).
export function PendingQueue({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const allSelected = useMemo(
    () => rows.length > 0 && rows.every((r) => selected.has(r.id)),
    [rows, selected],
  );
  const someSelected = selected.size > 0 && !allSelected;
  const selectedCount = selected.size;

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  function onBulkApprove() {
    if (selectedCount === 0) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkApprovePendingSignupsAction(ids);
      if (res.failed === 0) {
        toast.push(
          `Approved ${res.approved} ${res.approved === 1 ? "signup" : "signups"}.`,
          "success",
        );
      } else {
        toast.push(
          `Approved ${res.approved}, failed ${res.failed}. Check console for details.`,
          "error",
        );
      }
      setSelected(new Set());
    });
  }

  function onConfirmBulkReject() {
    if (selectedCount === 0) return;
    const ids = Array.from(selected);
    const sharedReason = reason;
    startTransition(async () => {
      const res = await bulkRejectPendingSignupsAction(ids, sharedReason);
      if (res.failed === 0) {
        toast.push(
          `Rejected ${res.rejected} ${res.rejected === 1 ? "signup" : "signups"}.`,
          "success",
        );
      } else {
        toast.push(
          `Rejected ${res.rejected}, failed ${res.failed}. Check console for details.`,
          "error",
        );
      }
      setSelected(new Set());
      setReason("");
      setBulkRejecting(false);
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Bulk toolbar — visible only when at least one row is selected. */}
      <div
        aria-live="polite"
        className={
          selectedCount > 0
            ? "flex flex-col gap-3 border-2 border-accent bg-accent/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            : "hidden"
        }
      >
        <p className="text-body-sm text-ink">
          <span className="font-mono text-meta uppercase tracking-[0.06em] text-accent">
            {selectedCount} selected
          </span>{" "}
          of {rows.length} pending
        </p>
        {!bulkRejecting ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBulkApprove}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center bg-accent px-4 text-nav-link uppercase text-white transition-colors hover:bg-accent/90 disabled:opacity-60"
            >
              {pending ? "Approving…" : `Approve ${selectedCount}`}
            </button>
            <button
              type="button"
              onClick={() => setBulkRejecting(true)}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center border border-hairline px-4 text-nav-link uppercase text-ink transition-colors hover:border-accent-2-text hover:text-accent-2-text disabled:opacity-60"
            >
              Reject {selectedCount}
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              disabled={pending}
              className="inline-flex min-h-[40px] items-center px-3 text-meta uppercase tracking-[0.06em] text-ink-2 transition-colors hover:text-ink disabled:opacity-60"
            >
              Clear selection
            </button>
          </div>
        ) : (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Optional shared reason — sent to all rejected applicants"
              className="border border-hairline bg-ground-2 px-3 py-2 text-body-sm text-ink focus:border-accent focus:outline-none sm:w-80"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirmBulkReject}
                disabled={pending}
                className="inline-flex min-h-[40px] items-center bg-accent-2-text px-3 text-nav-link uppercase text-white transition-colors hover:bg-accent-2-hover disabled:opacity-60"
              >
                {pending ? "Sending…" : `Confirm reject ${selectedCount}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBulkRejecting(false);
                  setReason("");
                }}
                disabled={pending}
                className="inline-flex min-h-[40px] items-center border border-hairline px-3 text-nav-link uppercase text-ink hover:border-accent hover:text-accent disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP — full table at sm and up. */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-hairline text-meta uppercase tracking-[0.06em] text-ink-2">
              <th className="py-3 pr-3 text-left">
                <label className="inline-flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      // Indeterminate state when SOME (not all) selected.
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={toggleAll}
                    className="size-4 border border-hairline accent-accent"
                    aria-label={allSelected ? "Unselect all" : "Select all"}
                  />
                </label>
              </th>
              <th className="py-3 pr-4 text-left">Email</th>
              <th className="py-3 pr-4 text-left">Name</th>
              <th className="py-3 pr-4 text-left">Role</th>
              <th className="py-3 pr-4 text-left">Submitted</th>
              <th className="py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-hairline last:border-b-0">
                <td className="py-3 pr-3 align-top">
                  <input
                    type="checkbox"
                    checked={selected.has(u.id)}
                    onChange={() => toggleOne(u.id)}
                    className="size-4 border border-hairline accent-accent"
                    aria-label={`Select ${u.email}`}
                  />
                </td>
                <td className="py-3 pr-4 align-top text-ink">{u.email}</td>
                <td className="py-3 pr-4 align-top text-ink-2">{u.displayName ?? "—"}</td>
                <td className="py-3 pr-4 align-top">
                  <span className="text-meta uppercase tracking-[0.06em] text-ink">{u.role}</span>
                </td>
                <td className="py-3 pr-4 align-top text-meta uppercase tracking-[0.06em] text-ink-2">
                  <time dateTime={u.createdAt.toISOString()}>
                    {dateFormatter.format(u.createdAt)}
                  </time>
                </td>
                <td className="py-3 align-top">
                  <PendingActions userId={u.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE — card list under sm breakpoint. */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {rows.map((u) => (
          <li key={u.id} className="flex flex-col gap-3 border border-hairline bg-ground-2 p-4">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selected.has(u.id)}
                onChange={() => toggleOne(u.id)}
                className="size-4 border border-hairline accent-accent"
                aria-label={`Select ${u.email}`}
              />
              <span className="text-meta uppercase tracking-[0.06em] text-ink-2">Select</span>
            </label>
            <div className="flex flex-col gap-1">
              <p className="text-body-sm text-ink">{u.email}</p>
              <p className="text-meta uppercase tracking-[0.06em] text-ink-2">
                {u.role} · {u.displayName ?? "—"} ·{" "}
                <time dateTime={u.createdAt.toISOString()}>
                  {dateFormatter.format(u.createdAt)}
                </time>
              </p>
            </div>
            <PendingActions userId={u.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
