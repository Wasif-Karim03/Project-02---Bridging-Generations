import type { StudentReport } from "@/lib/db/queries/mentorCalls";
import { MENTOR_CALL_QUESTIONS, MENTOR_CALL_SECTIONS } from "@/lib/mentor/callQuestions";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

// Shared read-only render of a student's collected mentor reports. Used by
// both the mentor's student profile and the admin's student detail page so
// the two views never drift.
export function ReportHistory({
  reports,
  emptyText,
}: {
  reports: StudentReport[];
  emptyText: string;
}) {
  if (reports.length === 0) {
    return (
      <p className="border border-hairline border-dashed bg-ground-2 px-4 py-8 text-center text-body text-ink-2">
        {emptyText}
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-4">
      {reports.map((r) => (
        <li key={r.id}>
          <ReportCard
            calledAt={r.calledAt}
            mentorName={r.mentorName}
            answers={(r.answers ?? {}) as Record<string, string>}
            notes={r.notes}
          />
        </li>
      ))}
    </ul>
  );
}

function ReportCard({
  calledAt,
  mentorName,
  answers,
  notes,
}: {
  calledAt: Date;
  mentorName: string;
  answers: Record<string, string>;
  notes: string | null;
}) {
  const answered = Object.keys(answers).filter((k) => answers[k]?.trim());
  return (
    <details className="border border-hairline bg-ground-2">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2 px-4 py-3 hover:bg-ground-3">
        <span className="text-heading-5 text-ink">{dateFormatter.format(calledAt)}</span>
        <span className="text-meta uppercase tracking-[0.06em] text-ink-2">
          {answered.length} answer{answered.length === 1 ? "" : "s"} · by {mentorName}
        </span>
      </summary>
      <div className="flex flex-col gap-5 border-hairline border-t px-4 py-4">
        {MENTOR_CALL_SECTIONS.map((sec) => {
          const rows = MENTOR_CALL_QUESTIONS.filter(
            (q) => q.section === sec.key && answers[q.id]?.trim(),
          );
          if (rows.length === 0) return null;
          return (
            <div key={sec.key} className="flex flex-col gap-2">
              <h4 className="text-eyebrow uppercase tracking-[0.1em] text-accent">{sec.title}</h4>
              <dl className="flex flex-col gap-2">
                {rows.map((q) => (
                  <div key={q.id} className="flex flex-col gap-0.5">
                    <dt className="text-body-sm text-ink-2">{q.prompt}</dt>
                    <dd className="whitespace-pre-line text-body text-ink">{answers[q.id]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
        {notes?.trim() ? (
          <div className="flex flex-col gap-0.5 border-hairline border-t pt-3">
            <span className="text-body-sm text-ink-2">Additional notes</span>
            <span className="whitespace-pre-line text-body text-ink">{notes}</span>
          </div>
        ) : null}
        {answered.length === 0 && !notes?.trim() ? (
          <p className="text-body-sm text-ink-2">No answers were recorded on this report.</p>
        ) : null}
      </div>
    </details>
  );
}
