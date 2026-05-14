import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { teacherCollection } from "@/keystatic/collections/teacher";
import { reader } from "./reader";

export type Teacher = Entry<typeof teacherCollection> & { id: string };

export async function getAllTeachers(): Promise<Teacher[]> {
  const entries = await reader.collections.teacher.all();
  return entries
    .map(({ slug, entry }) => ({ ...entry, id: slug }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getTeachersGroupedBySchool(): Promise<
  { schoolId: string | null; teachers: Teacher[] }[]
> {
  const all = await getAllTeachers();
  const buckets = new Map<string, Teacher[]>();
  const NULL_KEY = "__no-school__";
  for (const t of all) {
    const key = t.schoolId ?? NULL_KEY;
    const list = buckets.get(key) ?? [];
    list.push(t);
    buckets.set(key, list);
  }
  return Array.from(buckets.entries()).map(([key, teachers]) => ({
    schoolId: key === NULL_KEY ? null : key,
    teachers,
  }));
}
