import { NextResponse } from "next/server";
import { serializeTranslations } from "@/lib/developer/i18n";
import { isAuthenticated } from "@/lib/developer/session";
import { persistChanges } from "@/lib/developer/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  let payload: { en?: Record<string, string>; bn?: Record<string, string> };
  try {
    payload = (await request.json()) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  try {
    const changes = await serializeTranslations({
      en: payload.en ?? {},
      bn: payload.bn ?? {},
    });
    const mode = await persistChanges(
      changes,
      "content: update page text / translations (via editor)",
    );
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed." },
      { status: 500 },
    );
  }
}
