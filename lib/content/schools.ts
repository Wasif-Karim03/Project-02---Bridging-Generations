import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { schoolCollection } from "@/keystatic/collections/school";
import { reader } from "./reader";

type RawSchool = Entry<typeof schoolCollection>;
export type School = RawSchool & { id: string };

function normalize(slug: string, entry: RawSchool): School {
  return { ...entry, id: slug };
}

export async function getAllSchools(): Promise<School[]> {
  const entries = await reader.collections.school.all();
  return entries.map(({ slug, entry }) => normalize(slug, entry));
}

export async function getSchoolById(id: string): Promise<School | null> {
  const entry = await reader.collections.school.read(id);
  return entry ? normalize(id, entry) : null;
}
