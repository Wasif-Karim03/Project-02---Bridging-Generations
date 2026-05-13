import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Contact — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Contact",
    title: "Get in touch",
    subtitle: "Questions, partnerships, and press — the board reads every message.",
  });
}
