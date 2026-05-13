import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "About — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "About",
    title: "Who we are",
    subtitle: "Mission, board, transparency, and how we keep students in the classroom.",
  });
}
