import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { scholarshipsPageSingleton } from "@/keystatic/singletons/scholarshipsPage";
import { reader } from "./reader";

export type ScholarshipsPage = Entry<typeof scholarshipsPageSingleton>;

export async function getScholarshipsPage(): Promise<ScholarshipsPage | null> {
  return reader.singletons.scholarshipsPage.read();
}
