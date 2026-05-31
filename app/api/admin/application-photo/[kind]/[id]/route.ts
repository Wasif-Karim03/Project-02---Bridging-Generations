import { getCurrentDbUser } from "@/lib/auth";
import type { ApplicationRow } from "@/lib/content/applicationsMock";
import { getApplicationById } from "@/lib/db/queries/applications";

export const runtime = "nodejs";

// Serves an application's uploaded photo as raw image bytes (admin only) so the
// admin review pages can use a normal <img src> instead of embedding a multi-MB
// base64 string inline — which would blow past Vercel's ~4.5MB response limit
// and crash the page.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ kind: string; id: string }> },
) {
  const user = await getCurrentDbUser();
  if (!user || (user.role !== "admin" && user.role !== "it")) {
    return new Response("Forbidden", { status: 403 });
  }

  const { kind, id } = await params;
  const detail = await getApplicationById(kind as ApplicationRow["kind"], id);
  if (!detail) return new Response("Not found", { status: 404 });

  let data: string | null = null;
  let mime: string | null = null;
  if (detail.kind === "mentor" || detail.kind === "student-sponsorship") {
    data = detail.data.photoData ?? null;
    mime = detail.data.photoMimeType ?? null;
  }
  if (!data) return new Response("No photo", { status: 404 });

  const bytes = Buffer.from(data, "base64");
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime ?? "image/jpeg",
      "Cache-Control": "private, max-age=300",
      "Content-Length": String(bytes.length),
    },
  });
}
