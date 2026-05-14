import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { studentsPageSingleton } from "@/keystatic/singletons/studentsPage";
import { reader } from "./reader";

export type StudentsPage = Entry<typeof studentsPageSingleton>;

export async function getStudentsPage(): Promise<StudentsPage | null> {
  return reader.singletons.studentsPage.read();
}
