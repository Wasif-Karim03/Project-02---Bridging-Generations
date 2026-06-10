"use client";

import { useState } from "react";

type Student = { id: string; displayName: string };

const inputCls =
  "min-h-[44px] w-full rounded-lg border border-hairline bg-ground px-3 text-body text-ink";
const labelText = "text-meta uppercase tracking-[0.06em] text-ink-2";

// Search-as-you-type student selector. Filters by name OR register ID; picking
// a result fills both the student name and its register ID. Falls back to free
// text when the student isn't in the directory yet.
export function StudentPicker({ students }: { students: Student[] }) {
  const [name, setName] = useState("");
  const [ref, setRef] = useState("");
  const [open, setOpen] = useState(false);

  const q = name.trim().toLowerCase();
  const matches = (
    q
      ? students.filter(
          (s) => s.displayName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
        )
      : students
  ).slice(0, 8);

  function pick(s: Student) {
    setName(s.displayName);
    setRef(s.id);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className={labelText}>Student</span>
        <div className="relative">
          <input
            name="studentName"
            required
            autoComplete="off"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
            placeholder="Search by name or register ID"
            className={inputCls}
          />
          {open && matches.length > 0 ? (
            <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-hairline bg-ground shadow-[var(--shadow-card)]">
              {matches.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseDown={() => pick(s)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-body-sm text-ink hover:bg-ground-2"
                  >
                    <span>{s.displayName}</span>
                    <span className="shrink-0 text-meta text-ink-2">{s.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <span className="text-meta text-ink-2">
          {students.length
            ? "Start typing a name or register ID, then pick a match."
            : "No students in the directory yet — type a name and register ID below."}
        </span>
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelText}>Register ID</span>
        <input
          name="studentRef"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="auto-fills when you pick a student"
          className={inputCls}
        />
      </label>
    </div>
  );
}
