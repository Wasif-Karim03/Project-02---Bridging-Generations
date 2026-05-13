import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { donorsPageSingleton } from "@/keystatic/singletons/donorsPage";
import { reader } from "./reader";

export type DonorsPage = Entry<typeof donorsPageSingleton>;

export async function getDonorsPage(): Promise<DonorsPage> {
  const data = await reader.singletons.donorsPage.read();
  if (!data) {
    throw new Error(
      "donorsPage is missing — expected content/donors-page/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}
