import "server-only";
import type { Entry } from "@keystatic/core/reader";
import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import { studentRegistrations } from "@/db/schema";
import type { studentCollection } from "@/keystatic/collections/student";
import { reader } from "./reader";

type RawStudent = Entry<typeof studentCollection>;
export type Student = Omit<RawStudent, "community"> & {
  id: string;
  community?: Exclude<RawStudent["community"], "unknown">;
};

// ---- Approved DB students (auto-published) -------------------------------
// Students who applied via /student-signup and were approved by an admin are
// published to the public site straight from the database — no Keystatic record
// needed. We map the registration row into the same `Student` shape the cards +
// detail page consume. Only public-safe fields are surfaced; the photo is shown
// (consent granted) and served via the public /api/student-photo route.

function firstNameOf(full: string): string {
  const trimmed = (full ?? "").trim();
  return trimmed.split(/\s+/)[0] || trimmed;
}

type ApprovedRegRow = {
  id: string;
  studentName: string;
  grade: string | null;
  ethnicity: string | null;
  village: string | null;
  photoMimeType: string | null;
};

function registrationToStudent(r: ApprovedRegRow): Student {
  const gradeNum = Number.parseInt(String(r.grade ?? "").replace(/[^0-9]/g, ""), 10);
  const community =
    r.ethnicity && r.ethnicity.toLowerCase() !== "unknown" ? r.ethnicity : undefined;
  const name = firstNameOf(r.studentName);
  return {
    id: r.id,
    displayName: name,
    grade: Number.isFinite(gradeNum) ? gradeNum : 0,
    community,
    village: r.village ?? undefined,
    sponsorshipStatus: "waiting",
    portrait: r.photoMimeType
      ? { src: `/api/student-photo/${r.id}`, alt: `${name} portrait` }
      : undefined,
    consent: {
      portraitReleaseStatus: "granted",
      storyReleaseStatus: "granted",
      consentScope: ["website"],
    },
    // Remaining Keystatic-only fields are absent; the card + detail page guard
    // every one of them, so an unset value simply renders nothing.
  } as unknown as Student;
}

const APPROVED_REG_COLUMNS = {
  id: studentRegistrations.id,
  studentName: studentRegistrations.studentName,
  grade: studentRegistrations.grade,
  ethnicity: studentRegistrations.ethnicity,
  village: studentRegistrations.village,
  photoMimeType: studentRegistrations.photoMimeType,
} as const;

export async function getApprovedPublicStudents(): Promise<Student[]> {
  if (!isDbConfigured()) return [];
  const db = getDb();
  const rows = await db
    .select(APPROVED_REG_COLUMNS)
    .from(studentRegistrations)
    .where(eq(studentRegistrations.status, "approved"));
  return rows.map(registrationToStudent);
}

async function getApprovedPublicStudentById(id: string): Promise<Student | null> {
  if (!isDbConfigured()) return null;
  const db = getDb();
  const rows = await db
    .select({ ...APPROVED_REG_COLUMNS, status: studentRegistrations.status })
    .from(studentRegistrations)
    .where(eq(studentRegistrations.id, id))
    .limit(1);
  const r = rows[0];
  if (!r || r.status !== "approved") return null;
  return registrationToStudent(r);
}

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
  if (entry) return normalize(slug, entry);
  // Fall back to an approved DB student (auto-published applicants whose id is
  // their registration uuid, not a Keystatic slug).
  return getApprovedPublicStudentById(slug);
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
