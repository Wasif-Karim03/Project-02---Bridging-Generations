import { OG_CONTENT_TYPE, OG_SIZE, renderOGImage } from "@/lib/og/card";

export const runtime = "nodejs";
export const alt = "Bridging Generations — sponsoring 156 students in the Chittagong Hill Tracts";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOGImage({
    title: "Bridging Generations",
    subtitle: "Sponsoring 156 students across the Chittagong Hill Tracts, Bangladesh.",
  });
}
