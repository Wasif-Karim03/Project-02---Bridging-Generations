import { NextResponse } from "next/server";
import { getEntity } from "@/lib/developer/schema";
import { serializeEntity } from "@/lib/developer/serialize";
import { isAuthenticated } from "@/lib/developer/session";
import { persistChanges } from "@/lib/developer/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let payload: { entityKey?: string; slug?: string; values?: Record<string, unknown> };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const entity = getEntity(payload.entityKey ?? "");
  if (!entity) return NextResponse.json({ error: "Unknown section." }, { status: 404 });

  const values = payload.values ?? {};
  if (entity.type === "collection" && entity.slugField) {
    const slugSource = String(values[entity.slugField] ?? "").trim();
    if (!payload.slug && !slugSource) {
      return NextResponse.json(
        { error: `"${entity.slugField}" is required to create an entry.` },
        { status: 400 },
      );
    }
  }

  try {
    const { changes, slug } = serializeEntity(entity, values, payload.slug);
    const label = entity.type === "collection" ? `${entity.label}/${slug}` : entity.label;
    const mode = await persistChanges(changes, `content: update ${label} (via editor)`);
    return NextResponse.json({ ok: true, slug, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed." },
      { status: 500 },
    );
  }
}
