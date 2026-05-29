import { NextResponse } from "next/server";
import { getEntity } from "@/lib/developer/schema";
import { isAuthenticated } from "@/lib/developer/session";
import { type FileChange, persistChanges } from "@/lib/developer/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let payload: { entityKey?: string; slug?: string };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const entity = getEntity(payload.entityKey ?? "");
  if (!entity || entity.type !== "collection" || !payload.slug) {
    return NextResponse.json({ error: "Only collection entries can be deleted." }, { status: 400 });
  }

  const base = `${entity.dir}/${payload.slug}`;
  const ext = entity.fileKind === "mdx" ? "mdx" : "yaml";
  const changes: FileChange[] = [{ path: `${base}/index.${ext}`, remove: true }];
  // Remove any sibling markdown files this entity type can have.
  for (const field of entity.fields) {
    if (field.kind === "markdown" && field.key !== entity.bodyField) {
      changes.push({ path: `${base}/${field.key}.mdx`, remove: true });
    }
  }

  try {
    const mode = await persistChanges(
      changes,
      `content: delete ${entity.label}/${payload.slug} (via editor)`,
    );
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed." },
      { status: 500 },
    );
  }
}
