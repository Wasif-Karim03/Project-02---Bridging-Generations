import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Success stories — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Success stories",
    title: "Where they are now",
    subtitle: "Graduates whose lives sponsorship changed — in university, in work, at home.",
  });
}
