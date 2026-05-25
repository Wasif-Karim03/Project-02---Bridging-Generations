"use client";

import { useState } from "react";
import type { MonthlyGrowthPoint } from "@/lib/db/queries/studentGrowth";
import { StudentGrowthModal } from "./StudentGrowthModal";

type Props = {
  data: MonthlyGrowthPoint[];
  studentName: string;
};

export function StudentGrowthButton({ data, studentName }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-[48px] items-center border border-accent px-5 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
      >
        Student's Growth
      </button>
      <StudentGrowthModal
        open={open}
        onClose={() => setOpen(false)}
        studentName={studentName}
        data={data}
      />
    </>
  );
}
