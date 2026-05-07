import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { studentCollection } from "@/keystatic/collections/student";
import { reader } from "./reader";

type RawStudent = Entry<typeof studentCollection>;
export type Student = Omit<RawStudent, "community"> & {
  id: string;
  community?: Exclude<RawStudent["community"], "unknown">;
};

function normalize(slug: string, entry: RawStudent): Student {
  const { community, ...rest } = entry;
  return {
    ...rest,
    id: slug,
    community: community === "unknown" ? undefined : community,
  };
}

export async function getAllStudents(): Promise<Student[]> {
  const entries = await reader.collections.student.all();
  return entries.map(({ slug, entry }) => normalize(slug, entry));
}

export async function getSpotlightStudents(limit = 6): Promise<Student[]> {
  const all = await getAllStudents();
  return all.slice(0, limit);
}

export async function getStudentBySlug(slug: string): Promise<Student | null> {
  const entry = await reader.collections.student.read(slug);
  return entry ? normalize(slug, entry) : null;
}

export type StudentsBySchool = {
  schoolId: string;
  students: Student[];
};

export function groupStudentsBySchool(students: Student[]): StudentsBySchool[] {
  const bySchool = new Map<string, Student[]>();
  for (const student of students) {
    const key = student.schoolId ?? "";
    if (!key) continue;
    const bucket = bySchool.get(key) ?? [];
    bucket.push(student);
    bySchool.set(key, bucket);
  }
  return Array.from(bySchool.entries())
    .map(([schoolId, bucket]) => ({
      schoolId,
      students: [...bucket].sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        return a.displayName.localeCompare(b.displayName);
      }),
    }))
    .sort((a, b) => a.schoolId.localeCompare(b.schoolId));
}

export async function getStudentsGroupedBySchool(): Promise<StudentsBySchool[]> {
  return groupStudentsBySchool(await getAllStudents());
}
