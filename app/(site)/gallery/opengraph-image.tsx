import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Gallery — Bridging Generations";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    eyebrow: "Gallery",
    title: "In the classroom",
    subtitle: "Photos from the schools and communities in the Chittagong Hill Tracts.",
  });
}
