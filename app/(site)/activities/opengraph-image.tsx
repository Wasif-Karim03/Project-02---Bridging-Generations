import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Activities — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Activities",
    title: "On the ground",
    subtitle: "Events, school visits, and board work over the year.",
  });
}
