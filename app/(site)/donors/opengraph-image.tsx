import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Donation Journey — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Impact",
    title: "Our donation journey",
    subtitle: "Five years of funding tuition, meals, and materials for students in Bangladesh.",
  });
}
