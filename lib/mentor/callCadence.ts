// Mentor calls are expected every 15 days. The next-call date is purely
// advisory — we display it on the mentor dashboard, but don't enforce or
// block submission if a mentor logs a call early/late.

const CALL_INTERVAL_DAYS = 15;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function nextCallDueFrom(calledAt: Date): Date {
  return new Date(calledAt.getTime() + CALL_INTERVAL_DAYS * MS_PER_DAY);
}

// "How overdue is this?" — returns a number of days where positive means
// overdue, zero means due today, and negative means upcoming. null means
// no call has ever been logged.
export function daysOverdue(
  nextCallDueAt: Date | null | undefined,
  now = new Date(),
): number | null {
  if (!nextCallDueAt) return null;
  const diffMs = now.getTime() - nextCallDueAt.getTime();
  return Math.floor(diffMs / MS_PER_DAY);
}
