import { NextResponse } from "next/server";
import { getDeveloperPassword } from "@/lib/developer/config";
import { createSession, verifyPassword } from "@/lib/developer/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!getDeveloperPassword()) {
    return NextResponse.json(
      { error: "The editor is not configured. Set DEVELOPER_PASSWORD." },
      { status: 503 },
    );
  }
  let password = "";
  try {
    const body = (await request.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
