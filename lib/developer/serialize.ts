import "server-only";
import yaml from "js-yaml";
import type { Entity, Field } from "./schema";
import type { FileChange } from "./storage";

// Maps the manifest's editable values back onto the exact content/ file layout
// Keystatic reads. Two file shapes are produced:
//   - yaml   → content/.../index.yaml          (all fields as YAML)
//   - mdx    → content/.../index.mdx           (non-markdown fields as YAML
//                                                frontmatter; the body field as
//                                                the markdown body)
// Long-form markdown fields that are NOT the body field are written as sibling
// `<key>.mdx` files.

const YAML_OPTS = { indent: 2, lineWidth: -1, noRefs: true } as const;

export type ParsedFile = { data: Record<string, unknown>; body: string };

/** Split a raw `.mdx`/`.yaml` file into its YAML data and markdown body. */
export function parseFile(raw: string): ParsedFile {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (fmMatch) {
    const data = (yaml.load(fmMatch[1]) as Record<string, unknown>) ?? {};
    return { data, body: fmMatch[2].replace(/^\r?\n/, "") };
  }
  // No frontmatter: a pure-YAML data file.
  const data = (yaml.load(raw) as Record<string, unknown>) ?? {};
  return { data, body: "" };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Coerce a raw form value into the JSON shape the YAML file expects. */
function coerce(field: Field, value: unknown): unknown {
  switch (field.kind) {
    case "integer": {
      if (value === "" || value === null || value === undefined) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    case "boolean":
      return value === true || value === "true" || value === "on";
    case "date":
      // Keystatic date fields want a valid date string or null — never "".
      return typeof value === "string" && value.trim() !== "" ? value : null;
    case "multiselect":
      return Array.isArray(value) ? value.map(String) : [];
    case "relationship": {
      const s = typeof value === "string" ? value : "";
      return s === "" ? null : s;
    }
    case "object": {
      const obj = (value ?? {}) as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const f of field.fields) out[f.key] = coerce(f, obj[f.key]);
      return out;
    }
    case "array": {
      const arr = Array.isArray(value) ? value : [];
      return arr.map((item) => coerce(field.item, item));
    }
    case "markdown":
      return typeof value === "string" ? value : "";
    default:
      return typeof value === "string" ? value : value == null ? "" : String(value);
  }
}

/** Slug for a collection entry — provided slug wins, else derived from slugField. */
export function resolveSlug(
  entity: Entity,
  values: Record<string, unknown>,
  existingSlug?: string,
): string {
  if (existingSlug) return existingSlug;
  const field = entity.slugField;
  const source = field ? String(values[field] ?? "") : "";
  return slugify(source) || `entry-${Date.now()}`;
}

/**
 * Build the file changes needed to save an entity. `existingSlug` is set when
 * editing (so the slug/folder is preserved); omit it to create a new entry.
 */
export function serializeEntity(
  entity: Entity,
  values: Record<string, unknown>,
  existingSlug?: string,
): { changes: FileChange[]; slug: string } {
  const slug = entity.type === "collection" ? resolveSlug(entity, values, existingSlug) : "";
  const base = entity.type === "collection" ? `${entity.dir}/${slug}` : entity.dir;
  const ext = entity.fileKind === "mdx" ? "mdx" : "yaml";
  const indexPath = `${base}/index.${ext}`;

  const data: Record<string, unknown> = {};
  const changes: FileChange[] = [];
  let bodyMarkdown = "";

  for (const field of entity.fields) {
    if (field.kind === "markdown") {
      const md = typeof values[field.key] === "string" ? (values[field.key] as string) : "";
      if (entity.fileKind === "mdx" && field.key === entity.bodyField) {
        bodyMarkdown = md;
      } else {
        // Secondary markdown field → sibling file.
        changes.push({ path: `${base}/${field.key}.mdx`, content: md });
      }
      continue;
    }
    data[field.key] = coerce(field, values[field.key]);
  }

  const indexContent =
    entity.fileKind === "mdx"
      ? `---\n${yaml.dump(data, YAML_OPTS)}---\n\n${bodyMarkdown.trim()}\n`
      : yaml.dump(data, YAML_OPTS);

  changes.push({ path: indexPath, content: indexContent });
  return { changes, slug };
}
