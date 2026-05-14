"use client";

import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

type WeeklyReportFormProps = {
  studentSlug: string;
};

const ATTENDANCE_OPTIONS = [
  { value: "full", label: "Full attendance" },
  { value: "partial", label: "Partial — missed some" },
  { value: "absent", label: "Absent all week" },
  { value: "unknown", label: "Did not check in" },
] as const;

// Mentor weekly report form. Phase 6 wires this to a server action that
// writes a row into weekly_reports (Drizzle). Today it logs the would-be
// save and shows a success state so the UI is fully demoable.
export function WeeklyReportForm({ studentSlug }: WeeklyReportFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [weekOf, setWeekOf] = useState<string>(today);
  const [attendance, setAttendance] = useState<string>("full");
  const [studyNotes, setStudyNotes] = useState<string>("");
  const [actionItems, setActionItems] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    console.info("[mentor/report] would save:", {
      studentSlug,
      weekOf,
      attendance,
      studyNotes,
      actionItems,
    });
    await new Promise((r) => setTimeout(r, 400));
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="border border-accent bg-accent/5 p-6 text-body text-ink">
        <p className="text-heading-5 text-accent">Report filed (preview).</p>
        <p className="mt-2 text-body-sm text-ink-2">
          Phase 6 will persist this to the database and notify the board if the report flags any
          issues. For now this is a UI preview only.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setStudyNotes("");
            setActionItems("");
          }}
          className="mt-4 inline-flex min-h-[40px] items-center border border-accent px-4 text-nav-link uppercase text-accent transition-colors hover:bg-accent hover:text-white"
        >
          File another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <input type="hidden" name="studentSlug" value={studentSlug} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Week of *">
          {(args) => (
            <Input
              {...args}
              type="date"
              value={weekOf}
              onChange={(e) => setWeekOf(e.target.value)}
              required
            />
          )}
        </Field>
        <Field label="Attendance">
          {(args) => (
            <select
              id={args.id}
              aria-describedby={args["aria-describedby"]}
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className="h-11 border border-hairline bg-ground-2 px-3 text-body text-ink focus:border-accent focus:outline-none"
            >
              {ATTENDANCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <Field label="Study notes (what you worked on this week)">
        {(args) => (
          <Textarea
            {...args}
            value={studyNotes}
            onChange={(e) => setStudyNotes(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Topics covered, what's clicking, what's not."
          />
        )}
      </Field>

      <Field label="Action items / things the board should know">
        {(args) => (
          <Textarea
            {...args}
            value={actionItems}
            onChange={(e) => setActionItems(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Anything that needs the board's attention — health, family changes, attendance trend."
          />
        )}
      </Field>

      <div className="flex flex-wrap items-center gap-4 border-t border-hairline pt-5">
        <button
          type="submit"
          disabled={submitting || !studentSlug}
          className="inline-flex min-h-[44px] items-center bg-accent px-5 text-nav-link uppercase text-white shadow-[var(--shadow-cta)] transition-colors hover:bg-accent-2-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : "File report"}
        </button>
        {!studentSlug ? (
          <p className="text-meta uppercase tracking-[0.06em] text-accent-2-text">
            Pick a student from the mentor dashboard first.
          </p>
        ) : null}
      </div>
    </form>
  );
}
