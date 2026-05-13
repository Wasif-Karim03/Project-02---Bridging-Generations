import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Donate — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Donate",
    title: "Sponsor a student",
    subtitle: "Recurring or one-time — your gift goes directly to tuition, meals, and books.",
  });
}
