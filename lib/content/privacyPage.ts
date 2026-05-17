import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { privacyPageSingleton } from "@/keystatic/singletons/privacyPage";
import { reader } from "./reader";

export type PrivacyPage = Entry<typeof privacyPageSingleton>;

export async function getPrivacyPage(): Promise<PrivacyPage> {
  const data = await reader.singletons.privacyPage.read();
  if (!data) {
    throw new Error(
      "privacyPage is missing — expected content/privacy-page/index.mdx. Edit it via /keystatic.",
    );
  }
  return data;
}
