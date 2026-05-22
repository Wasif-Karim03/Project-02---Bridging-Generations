"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { SheetDrawer } from "@/components/ui/SheetDrawer";
import type { MonthlyGrowthPoint } from "@/lib/db/queries/studentGrowth";
import { StudentGrowthChart } from "./StudentGrowthChart";

type Props = {
  open: boolean;
  onClose: () => void;
  studentName: string;
  data: MonthlyGrowthPoint[];
};

export function StudentGrowthModal({ open, onClose, studentName, data }: Props) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
  const defaultYear = years[years.length - 1] ?? new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const pointsForYear = data.filter((d) => d.year === selectedYear);

  return (
    <SheetDrawer open={open} onClose={onClose} ariaLabel={`${studentName}'s growth`}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
          <div>
            <p className="text-eyebrow uppercase tracking-[0.12em] text-ink-2">Progress</p>
            <h2 className="mt-0.5 text-heading-5 font-bold text-ink">{studentName}'s Growth</h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 flex size-10 items-center justify-center text-ink-2 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {data.length === 0 ? (
            <p className="text-body text-ink-2">
              No mentor reports have been filed for {studentName} yet. Growth data will appear here
              as mentors submit weekly check-ins.
            </p>
          ) : (
            <>
              {/* Year tabs */}
              {years.length > 1 && (
                <div role="tablist" aria-label="Year" className="mb-6 flex flex-wrap gap-2">
                  {years.map((y) => (
                    <button
                      key={y}
                      type="button"
                      role="tab"
                      aria-selected={y === selectedYear}
                      onClick={() => setSelectedYear(y)}
                      className={
                        y === selectedYear
                          ? "rounded-none border border-accent bg-accent px-4 py-1.5 text-meta font-semibold uppercase tracking-[0.06em] text-white"
                          : "rounded-none border border-hairline px-4 py-1.5 text-meta uppercase tracking-[0.06em] text-ink-2 transition-colors hover:border-accent hover:text-accent"
                      }
                    >
                      {y}
                    </button>
                  ))}
                </div>
              )}

              {/* Chart */}
              {pointsForYear.length === 0 ? (
                <p className="text-body text-ink-2">No reports filed for {selectedYear}.</p>
              ) : (
                <>
                  <StudentGrowthChart points={pointsForYear} />
                  <p className="mt-3 text-meta text-ink-2">
                    Attendance rate per month — based on{" "}
                    {pointsForYear.reduce((s, p) => s + p.reportCount, 0)} mentor{" "}
                    {pointsForYear.reduce((s, p) => s + p.reportCount, 0) === 1
                      ? "report"
                      : "reports"}{" "}
                    in {selectedYear}.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </SheetDrawer>
  );
}
