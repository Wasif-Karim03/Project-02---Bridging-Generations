import Image, { type ImageProps } from "next/image";
import type { CSSProperties } from "react";

type Ladder = "portrait" | "square";

type MobileImageProps = Omit<ImageProps, "style" | "fill" | "width" | "height"> & {
  /** Aspect-ladder shape: portrait (4:5 → 16:9) or square (1:1 → 16:9). */
  ladder: Ladder;
  /** Editorial focal point at <640px viewports. Defaults to {x:50, y:30}. */
  mobileFocalPoint?: { x: number; y: number } | null;
  /** className passed to the wrapper (not the <img>). */
  wrapperClassName?: string;
};

/**
 * Wrapper around next/image that applies a mobile aspect-ladder + a
 * per-image mobile focal point. The Image fills the wrapper; the
 * wrapper provides the aspect ratio at viewport-conditional breakpoints.
 *
 * The focal point is exposed as CSS custom properties (--mobile-fp-x,
 * --mobile-fp-y) and consumed by globals.css inside @media (max-width:
 * 640px) on `.mobile-fp` to set object-position only on phones. Desktop
 * uses default object-position (centered).
 */
export function MobileImage({
  ladder,
  mobileFocalPoint,
  wrapperClassName,
  alt,
  ...imageProps
}: MobileImageProps) {
  const x = mobileFocalPoint?.x ?? 50;
  const y = mobileFocalPoint?.y ?? 30;

  const ladderClass = ladder === "portrait" ? "mobile-aspect-portrait" : "mobile-aspect-square";

  const style = {
    "--mobile-fp-x": `${x}%`,
    "--mobile-fp-y": `${y}%`,
  } as CSSProperties;

  return (
    <div
      className={["relative w-full mobile-fp", ladderClass, wrapperClassName]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <Image {...imageProps} alt={alt} fill className="object-cover" />
    </div>
  );
}
