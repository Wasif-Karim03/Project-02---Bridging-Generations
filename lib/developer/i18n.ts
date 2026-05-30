import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FileChange } from "./storage";

// Bilingual UI-copy editor backing. The public site's fixed text (nav, footer,
// page headings, hero/CTA copy) lives in next-intl message files — one per
// locale — NOT in Keystatic. This module reads them as aligned English/Bengali
// pairs and writes both back, so the owner can edit visible copy in both
// languages without touching code.

const EN_PATH = "messages/en.json";
const BN_PATH = "messages/bn.json";
const ROOT = process.cwd();

type Json = Record<string, unknown>;

async function load(rel: string): Promise<Json> {
  try {
    return JSON.parse(await readFile(path.join(ROOT, rel), "utf-8")) as Json;
  } catch {
    return {};
  }
}

/** Flatten nested message objects to dot-path → string, keeping only string leaves. */
function flatten(obj: Json, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") out[p] = value;
    else if (value && typeof value === "object") Object.assign(out, flatten(value as Json, p));
  }
  return out;
}

/** Set a dot-path leaf on a nested object, creating intermediate objects as needed. */
function setPath(obj: Json, dotted: string, value: string): void {
  const parts = dotted.split(".");
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof node[k] !== "object" || node[k] === null) node[k] = {};
    node = node[k] as Json;
  }
  node[parts[parts.length - 1]] = value;
}

export type TransItem = { path: string; en: string; bn: string };
export type TransGroup = { section: string; items: TransItem[] };

// Friendly section names for the dashboard grouping.
const SECTION_LABELS: Record<string, string> = {
  nav: "Navigation bar",
  footer: "Footer",
  home: "Home page",
  about: "About page",
  missionVision: "Mission & Vision page",
  donationJourney: "Donation journey page",
  blog: "Blog page",
  gallery: "Gallery page",
  students: "Students page — filters",
  common: "Shared buttons & labels",
};

export function sectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

/** Read both locale files as aligned EN/BN pairs, grouped by top-level section. */
export async function readTranslations(): Promise<TransGroup[]> {
  const [en, bn] = await Promise.all([load(EN_PATH), load(BN_PATH)]);
  const enFlat = flatten(en);
  const bnFlat = flatten(bn);
  const groups = new Map<string, TransItem[]>();
  for (const p of Object.keys(enFlat)) {
    const section = p.split(".")[0];
    const list = groups.get(section) ?? [];
    list.push({ path: p, en: enFlat[p] ?? "", bn: bnFlat[p] ?? "" });
    groups.set(section, list);
  }
  return [...groups.entries()].map(([section, items]) => ({ section, items }));
}

/**
 * Apply edited EN/BN values back onto the original files. Originals are loaded
 * first so key order and any non-string structure are preserved; only leaves
 * named in the updates are overwritten (missing Bengali keys get created).
 */
export async function serializeTranslations(updates: {
  en: Record<string, string>;
  bn: Record<string, string>;
}): Promise<FileChange[]> {
  const [en, bn] = await Promise.all([load(EN_PATH), load(BN_PATH)]);
  for (const [p, v] of Object.entries(updates.en)) setPath(en, p, v);
  for (const [p, v] of Object.entries(updates.bn)) setPath(bn, p, v);
  return [
    { path: EN_PATH, content: `${JSON.stringify(en, null, 2)}\n` },
    { path: BN_PATH, content: `${JSON.stringify(bn, null, 2)}\n` },
  ];
}
