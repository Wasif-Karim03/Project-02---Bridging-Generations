import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { donatePageSingleton } from "@/keystatic/singletons/donatePage";
import { reader } from "./reader";

export type DonatePage = Entry<typeof donatePageSingleton>;

export async function getDonatePage(): Promise<DonatePage> {
  const data = await reader.singletons.donatePage.read();
  if (!data) {
    throw new Error(
      "donatePage is missing — expected content/donate-page/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}
