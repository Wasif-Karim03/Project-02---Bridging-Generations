import "server-only";
import { AwsClient } from "aws4fetch";

// Cloudflare R2 image storage. Uploads use the S3-compatible API (signed with
// aws4fetch); files are served from the bucket's public URL (r2.dev subdomain
// or a custom domain). All config comes from env vars so nothing is committed.
//
//   R2_ACCOUNT_ID          — Cloudflare account id
//   R2_ACCESS_KEY_ID       — R2 API token access key
//   R2_SECRET_ACCESS_KEY   — R2 API token secret
//   R2_BUCKET              — bucket name (default: bridging-generations-media)
//   R2_PUBLIC_URL          — public base URL, e.g. https://pub-xxxx.r2.dev

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_PUBLIC_URL,
  );
}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export function extForType(type: string): string | null {
  return EXT_BY_TYPE[type] ?? null;
}

function bucket(): string {
  return process.env.R2_BUCKET || "bridging-generations-media";
}

function endpoint(): string {
  return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
}

/**
 * Upload a binary object to R2 and return its public URL. `key` is the object
 * path within the bucket (e.g. "projects/<id>/<uuid>.jpg").
 */
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!isR2Configured()) throw new Error("Cloudflare R2 is not configured.");
  const client = new AwsClient({
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    service: "s3",
    region: "auto",
  });
  const url = `${endpoint()}/${bucket()}/${key}`;
  const res = await client.fetch(url, {
    method: "PUT",
    body: new Uint8Array(body),
    headers: { "Content-Type": contentType },
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed (${res.status}): ${await res.text()}`);
  }
  const base = (process.env.R2_PUBLIC_URL as string).replace(/\/+$/, "");
  return `${base}/${key}`;
}

/** Delete an object from R2 by its public URL (best-effort; ignores errors). */
export async function deleteFromR2ByUrl(publicUrl: string): Promise<void> {
  if (!isR2Configured()) return;
  const base = (process.env.R2_PUBLIC_URL as string).replace(/\/+$/, "");
  if (!publicUrl.startsWith(base)) return;
  const key = publicUrl.slice(base.length + 1);
  try {
    const client = new AwsClient({
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
      service: "s3",
      region: "auto",
    });
    await client.fetch(`${endpoint()}/${bucket()}/${key}`, { method: "DELETE" });
  } catch {
    // best-effort cleanup
  }
}
