import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Create Your Donor Profile — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Donor profile",
    title: "Tell us about yourself",
    subtitle: "Set up a public or anonymous donor profile before you give.",
  });
}
