import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { schoolCollection } from "@/keystatic/collections/school";
import { reader } from "./reader";

type RawSchool = Entry<typeof schoolCollection>;
export type School = RawSchool & { id: string };

// Client-safe school shape — strips the `overview` MDX field which is an
// async function and cannot be serialized across the server/client boundary.
// Use this when passing school data into a Client Component.
export type SchoolSummary = Omit<School, "overview">;

export function toSchoolSummary(school: School): SchoolSummary {
  const { overview: _overview, ...rest } = school;
  return rest;
}

function normalize(slug: string, entry: RawSchool): School {
  return { ...entry, id: slug };
}

export async function getAllSchools(): Promise<School[]> {
  const entries = await reader.collections.school.all();
  return entries.map(({ slug, entry }) => normalize(slug, entry));
}

export async function getAllSchoolSummaries(): Promise<SchoolSummary[]> {
  const all = await getAllSchools();
  return all.map(toSchoolSummary);
}

export async function getSchoolById(id: string): Promise<School | null> {
  const entry = await reader.collections.school.read(id);
  return entry ? normalize(id, entry) : null;
}
