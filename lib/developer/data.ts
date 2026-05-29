import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { type Entity, type Field, getEntity } from "./schema";
import { parseFile } from "./serialize";

const ROOT = process.cwd();

async function readMaybe(relPath: string): Promise<string | null> {
  try {
    return await readFile(path.join(ROOT, relPath), "utf-8");
  } catch {
    return null;
  }
}

/** Shape a stored value (or absence) into what the form control expects. */
function withDefaults(field: Field, raw: unknown): unknown {
  switch (field.kind) {
    case "integer":
      return typeof raw === "number" ? raw : raw == null || raw === "" ? "" : Number(raw);
    case "boolean":
      return raw === true;
    case "multiselect":
      return Array.isArray(raw) ? raw.map(String) : [];
    case "relationship":
      return typeof raw === "string" ? raw : "";
    case "object": {
      const obj = (raw ?? {}) as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const f of field.fields) out[f.key] = withDefaults(f, obj[f.key]);
      return out;
    }
    case "array": {
      const arr = Array.isArray(raw) ? raw : [];
      return arr.map((item) => withDefaults(field.item, item));
    }
    case "markdown":
      return typeof raw === "string" ? raw : "";
    default:
      return typeof raw === "string" ? raw : raw == null ? "" : String(raw);
  }
}

/** Read the current editable values for an entity (singleton or collection entry). */
export async function readEntityValues(
  entity: Entity,
  slug?: string,
): Promise<Record<string, unknown>> {
  const base = entity.type === "collection" && slug ? `${entity.dir}/${slug}` : entity.dir;
  const ext = entity.fileKind === "mdx" ? "mdx" : "yaml";
  const raw = await readMaybe(`${base}/index.${ext}`);
  const parsed = raw ? parseFile(raw) : { data: {}, body: "" };

  const values: Record<string, unknown> = {};
  for (const field of entity.fields) {
    if (field.kind === "markdown") {
      if (entity.fileKind === "mdx" && field.key === entity.bodyField) {
        values[field.key] = parsed.body.trim();
      } else {
        const sibling = await readMaybe(`${base}/${field.key}.mdx`);
        values[field.key] = (sibling ?? "").trim();
      }
      continue;
    }
    values[field.key] = withDefaults(field, parsed.data[field.key]);
  }
  return values;
}

export type CollectionItem = { slug: string; label: string };

/** List existing entries in a collection, sorted by label. */
export async function listCollection(entity: Entity): Promise<CollectionItem[]> {
  if (entity.type !== "collection") return [];
  let dirents: string[] = [];
  try {
    const entries = await readdir(path.join(ROOT, entity.dir), { withFileTypes: true });
    dirents = entries.filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
  const items = await Promise.all(
    dirents.map(async (slug) => {
      const values = await readEntityValues(entity, slug);
      const label = entity.slugField ? String(values[entity.slugField] ?? slug) : slug;
      return { slug, label: label || slug };
    }),
  );
  return items.sort((a, b) => a.label.localeCompare(b.label));
}

/** Options for a relationship dropdown: slug + human label from the target collection. */
export async function relationshipOptions(collectionKey: string): Promise<CollectionItem[]> {
  const target = getEntity(collectionKey);
  if (!target) return [];
  return listCollection(target);
}

/** Resolve every relationship field in an entity to its option list. */
export async function collectRelationshipOptions(
  entity: Entity,
): Promise<Record<string, CollectionItem[]>> {
  const collections = new Set<string>();
  const walk = (fields: Field[]) => {
    for (const f of fields) {
      if (f.kind === "relationship") collections.add(f.collection);
      else if (f.kind === "object") walk(f.fields);
      else if (f.kind === "array") walk([f.item]);
    }
  };
  walk(entity.fields);
  const out: Record<string, CollectionItem[]> = {};
  await Promise.all(
    [...collections].map(async (key) => {
      out[key] = await relationshipOptions(key);
    }),
  );
  return out;
}
