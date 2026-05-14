// Mock donation data used by the donor dashboard until DATABASE_URL is set
// and the Stripe webhook starts writing real rows. The shapes match the
// Drizzle `donations` select type so swapping to real reads is a one-liner.

export type DonationRow = {
  id: string;
  occurredAt: Date;
  amountCents: number;
  currency: string;
  recurring: boolean;
  source: "stripe" | "bkash" | "manual";
  externalReference: string | null;
  status: "pending" | "succeeded" | "failed" | "refunded";
  studentSlug: string | null;
  projectSlug: string | null;
  dedicationText: string | null;
  donorUserId: string | null;
};

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const MOCK_DONATIONS: DonationRow[] = [
  {
    id: "demo-1",
    occurredAt: daysAgo(3),
    amountCents: 3000,
    currency: "usd",
    recurring: true,
    source: "stripe",
    externalReference: "cs_test_demo_001",
    status: "succeeded",
    studentSlug: "priyonti-barua",
    projectSlug: null,
    dedicationText: "For Priyonti — keep going",
    donorUserId: null,
  },
  {
    id: "demo-2",
    occurredAt: daysAgo(34),
    amountCents: 3000,
    currency: "usd",
    recurring: true,
    source: "stripe",
    externalReference: "cs_test_demo_002",
    status: "succeeded",
    studentSlug: "priyonti-barua",
    projectSlug: null,
    dedicationText: "For Priyonti — keep going",
    donorUserId: null,
  },
  {
    id: "demo-3",
    occurredAt: daysAgo(65),
    amountCents: 12000,
    currency: "usd",
    recurring: false,
    source: "stripe",
    externalReference: "cs_test_demo_003",
    status: "succeeded",
    studentSlug: null,
    projectSlug: "shobhana-mahathera-school",
    dedicationText: "Materials drive — happy to help",
    donorUserId: null,
  },
  {
    id: "demo-4",
    occurredAt: daysAgo(120),
    amountCents: 6000,
    currency: "usd",
    recurring: false,
    source: "stripe",
    externalReference: "cs_test_demo_004",
    status: "succeeded",
    studentSlug: null,
    projectSlug: "educational-fundraising",
    dedicationText: null,
    donorUserId: null,
  },
];

export function formatDonationAmount(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function donationsForCurrentMonth(all: DonationRow[]): DonationRow[] {
  const now = new Date();
  return all.filter(
    (d) =>
      d.occurredAt.getUTCFullYear() === now.getUTCFullYear() &&
      d.occurredAt.getUTCMonth() === now.getUTCMonth(),
  );
}

export function donationsForPreviousMonth(all: DonationRow[]): DonationRow[] {
  const now = new Date();
  const month = now.getUTCMonth() === 0 ? 11 : now.getUTCMonth() - 1;
  const year = now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear();
  return all.filter(
    (d) => d.occurredAt.getUTCFullYear() === year && d.occurredAt.getUTCMonth() === month,
  );
}

export function totalCents(rows: DonationRow[]): number {
  return rows.reduce((sum, r) => sum + r.amountCents, 0);
}
