import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { termsPageSingleton } from "@/keystatic/singletons/termsPage";
import { reader } from "./reader";

export type TermsPage = Entry<typeof termsPageSingleton>;

export async function getTermsPage(): Promise<TermsPage> {
  const data = await reader.singletons.termsPage.read();
  if (!data) {
    throw new Error(
      "termsPage is missing — expected content/terms-page/index.mdx. Edit it via /keystatic.",
    );
  }
  return data;
}
