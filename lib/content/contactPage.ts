import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { contactPageSingleton } from "@/keystatic/singletons/contactPage";
import { reader } from "./reader";

export type ContactPage = Entry<typeof contactPageSingleton>;

export async function getContactPage(): Promise<ContactPage> {
  const data = await reader.singletons.contactPage.read();
  if (!data) {
    throw new Error(
      "contactPage is missing — expected content/contact-page/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}
