import "server-only";

// Reads an uploaded image from a multipart form field and returns it as base64
// for private storage in Postgres (never the public repo). Returns null when no
// file was provided, or an { error } when it's too big or the wrong type.
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type UploadedPhoto = { data: string; mime: string };

export async function readUploadedPhoto(
  formData: FormData,
  field = "photo",
): Promise<UploadedPhoto | { error: string } | null> {
  const photo = formData.get(field);
  if (!(photo instanceof File) || photo.size === 0) return null;
  if (photo.size > MAX_PHOTO_BYTES) {
    return { error: "Photo is larger than 4MB. Please use a smaller image." };
  }
  if (!ALLOWED_PHOTO_TYPES.has(photo.type)) {
    return { error: "Photo must be a JPG, PNG, or WebP image." };
  }
  const buf = Buffer.from(await photo.arrayBuffer());
  return { data: buf.toString("base64"), mime: photo.type };
}
