// Shared, framework-free helpers for the admin-curated donor wall. Pure
// functions (no "server-only") so both server components and client editor
// forms can import them.

export function dollarsFromCents(cents: number): number {
  return Math.round(cents) / 100;
}

// Matches the donor-sheet look: whole dollars render as "540 USD"; fractional
// amounts keep two decimals.
export function formatUsd(cents: number): string {
  const dollars = dollarsFromCents(cents);
  const n = Number.isInteger(dollars)
    ? dollars.toLocaleString("en-US")
    : dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n} USD`;
}

// Plain dollar number for table cells (the "Amount (USD)" column shows 60, 310).
export function formatDollars(cents: number): string {
  const dollars = dollarsFromCents(cents);
  return Number.isInteger(dollars)
    ? dollars.toLocaleString("en-US")
    : dollars.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Parse a "$60" / "60" / "60.50" admin input into integer cents. Returns null
// when the input isn't a usable non-negative number.
export function centsFromDollarsInput(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const v = Number.parseFloat(cleaned);
  if (!Number.isFinite(v) || v < 0) return null;
  return Math.round(v * 100);
}

// "2024-12", or just "2024" when the month is unknown.
export function formatYearMonth(year: number | null, month: number | null): string {
  if (!year) return "—";
  return month ? `${year}-${month}` : String(year);
}

export function slugifyName(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  return base || "donor";
}

// Up-to-two-letter initials for the photo fallback circle.
export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
