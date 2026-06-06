import { eq } from "drizzle-orm";
import { getDb, isDbConfigured } from "@/db/client";
import { studentRegistrations } from "@/db/schema";

export const runtime = "nodejs";

// Public photo endpoint for APPROVED students only. Serves the uploaded photo
// as raw bytes (so the public student cards can use <img>/next-image instead of
// embedding multi-MB base64). Privacy boundary: a photo is only served when the
// registration's status is "approved" — pending/rejected applications never
// expose their photo here. Unlike the admin photo route, this is intentionally
// unauthenticated so the public /students page (and next/image's optimizer) can
// load it.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDbConfigured()) return new Response("Not found", { status: 404 });

  const db = getDb();
  const rows = await db
    .select({
      status: studentRegistrations.status,
      data: studentRegistrations.photoData,
      mime: studentRegistrations.photoMimeType,
    })
    .from(studentRegistrations)
    .where(eq(studentRegistrations.id, id))
    .limit(1);

  const r = rows[0];
  if (!r || r.status !== "approved" || !r.data) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = Buffer.from(r.data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": r.mime ?? "image/jpeg",
      "Cache-Control": "public, max-age=300",
      "Content-Length": String(bytes.length),
    },
  });
}
