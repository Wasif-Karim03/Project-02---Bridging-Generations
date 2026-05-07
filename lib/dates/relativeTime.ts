// Relative-time stamps for editorial use ("3 weeks ago" / "yesterday" /
// "in 2 months"). Falls back to absolute date when ≥12 months out so the
// timeline does not drift into "11 months ago" prose at older entries.
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365 * MS_PER_DAY;

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const absoluteFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function relativeTime(date: Date, now: Date = new Date()): string {
  const diff = date.getTime() - now.getTime();
  const abs = Math.abs(diff);

  if (abs >= MS_PER_YEAR) {
    return absoluteFormatter.format(date);
  }
  if (abs >= MS_PER_MONTH) {
    return formatter.format(Math.round(diff / MS_PER_MONTH), "month");
  }
  if (abs >= MS_PER_WEEK) {
    return formatter.format(Math.round(diff / MS_PER_WEEK), "week");
  }
  if (abs >= MS_PER_DAY) {
    return formatter.format(Math.round(diff / MS_PER_DAY), "day");
  }
  if (abs >= MS_PER_HOUR) {
    return formatter.format(Math.round(diff / MS_PER_HOUR), "hour");
  }
  if (abs >= MS_PER_MINUTE) {
    return formatter.format(Math.round(diff / MS_PER_MINUTE), "minute");
  }
  return formatter.format(Math.round(diff / MS_PER_SECOND), "second");
}
