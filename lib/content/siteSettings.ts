import "server-only";
import type { Entry } from "@keystatic/core/reader";
import type { siteSettingsSingleton } from "@/keystatic/singletons/siteSettings";
import { reader } from "./reader";

export type SiteSettings = Entry<typeof siteSettingsSingleton>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await reader.singletons.siteSettings.read();
  if (!data) {
    throw new Error(
      "siteSettings is missing — expected content/site-settings/index.yaml. Edit it via /keystatic.",
    );
  }
  return data;
}
