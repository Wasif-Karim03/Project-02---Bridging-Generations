import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import type { DonorContribution, FeaturedDonor } from "@/db/schema";
import { donorContributions, featuredDonors } from "@/db/schema";
import { slugifyName } from "@/lib/donor/featured";

export type DonorSummary = FeaturedDonor & {
  totalCents: number;
  studentCount: number;
  giftCount: number;
};

export type DonorWithContributions = FeaturedDonor & {
  contributions: DonorContribution[];
  totalCents: number;
  studentCount: number;
};

// A student is "one student" by their ref (the "ID: 265") when present, else by
// name — so the same student appearing in two rows counts once.
function studentKey(c: { studentRef: string | null; studentName: string }): string {
  return (c.studentRef || c.studentName).trim().toLowerCase();
}

function summarize(contribs: DonorContribution[]) {
  const totalCents = contribs.reduce((s, c) => s + c.amountCents, 0);
  const studentCount = new Set(contribs.map(studentKey)).size;
  return { totalCents, studentCount };
}

// List donors with computed totals. `publishedOnly` for the public wall.
export async function listFeaturedDonors(
  opts: { publishedOnly?: boolean } = {},
): Promise<DonorSummary[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const base = db.select().from(featuredDonors);
  const donors = await (opts.publishedOnly
    ? base.where(eq(featuredDonors.published, true))
    : base
  ).orderBy(asc(featuredDonors.displayOrder), asc(featuredDonors.name));
  if (donors.length === 0) return [];
  const allContribs = await db.select().from(donorContributions);
  return donors.map((d) => {
    const rows = allContribs.filter((c) => c.donorId === d.id);
    const { totalCents, studentCount } = summarize(rows);
    return { ...d, totalCents, studentCount, giftCount: rows.length };
  });
}

async function withContributions(
  donor: FeaturedDonor,
): Promise<DonorWithContributions> {
  const db = getDb();
  const contributions = await db
    .select()
    .from(donorContributions)
    .where(eq(donorContributions.donorId, donor.id))
    .orderBy(desc(donorContributions.year), desc(donorContributions.month));
  return { ...donor, contributions, ...summarize(contributions) };
}

export async function getFeaturedDonorBySlug(
  slug: string,
): Promise<DonorWithContributions | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(featuredDonors)
    .where(eq(featuredDonors.slug, slug))
    .limit(1);
  return rows[0] ? withContributions(rows[0]) : null;
}

export async function getFeaturedDonorById(
  id: string,
): Promise<DonorWithContributions | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db.select().from(featuredDonors).where(eq(featuredDonors.id, id)).limit(1);
  return rows[0] ? withContributions(rows[0]) : null;
}

async function uniqueSlug(name: string): Promise<string> {
  const db = getDb();
  const base = slugifyName(name);
  const existing = await db
    .select({ slug: featuredDonors.slug })
    .from(featuredDonors);
  const taken = new Set(existing.map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createFeaturedDonor(input: {
  name: string;
  photoUrl?: string | null;
  blurb?: string | null;
  published?: boolean;
  displayOrder?: number;
}): Promise<FeaturedDonor> {
  const db = getDb();
  const slug = await uniqueSlug(input.name);
  const [row] = await db
    .insert(featuredDonors)
    .values({
      slug,
      name: input.name,
      photoUrl: input.photoUrl || null,
      blurb: input.blurb || null,
      published: input.published ?? true,
      displayOrder: input.displayOrder ?? 0,
    })
    .returning();
  return row;
}

export async function updateFeaturedDonor(
  id: string,
  patch: {
    name?: string;
    photoUrl?: string | null;
    blurb?: string | null;
    published?: boolean;
    displayOrder?: number;
  },
): Promise<void> {
  const db = getDb();
  await db
    .update(featuredDonors)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(featuredDonors.id, id));
}

export async function deleteFeaturedDonor(id: string): Promise<void> {
  const db = getDb();
  // Contributions cascade via the FK.
  await db.delete(featuredDonors).where(eq(featuredDonors.id, id));
}

export async function addContribution(input: {
  donorId: string;
  studentName: string;
  studentRef?: string | null;
  amountCents: number;
  year?: number | null;
  month?: number | null;
}): Promise<void> {
  const db = getDb();
  await db.insert(donorContributions).values({
    donorId: input.donorId,
    studentName: input.studentName,
    studentRef: input.studentRef || null,
    amountCents: input.amountCents,
    year: input.year ?? null,
    month: input.month ?? null,
  });
}

export async function deleteContribution(id: string): Promise<void> {
  const db = getDb();
  await db.delete(donorContributions).where(eq(donorContributions.id, id));
}
