// Framework-free helpers for project fundraising display. Pure functions so
// both server components and client editors can use them.

export function fundingPercent(raisedCents: number, targetCents: number): number {
  if (targetCents <= 0) return raisedCents > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((raisedCents / targetCents) * 100)));
}

export function remainingCents(raisedCents: number, targetCents: number): number {
  return Math.max(0, targetCents - raisedCents);
}

// "$3,500" — whole dollars; two decimals only when needed.
export function formatMoney(cents: number): string {
  const dollars = Math.round(cents) / 100;
  const n = Number.isInteger(dollars)
    ? dollars.toLocaleString("en-US")
    : dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${n}`;
}

export function centsFromDollarsInput(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const v = Number.parseFloat(cleaned);
  if (!Number.isFinite(v) || v < 0) return null;
  return Math.round(v * 100);
}

export function slugifyProject(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return base || "project";
}
