/**
 * Build an SVG path d-string for a cubic-bezier easing curve. Used by Motion
 * Lab timing diagrams on /design to sketch each token's easing curve.
 *
 * The curve is rendered in a width × height box: x = time (0 → width),
 * y = progress drawn from bottom-left to top-right (SVG y is inverted, so
 * progress=1 → y=0). Control points in the cubic-bezier 4-tuple are
 * normalized [0,1] and mapped into the box.
 */
export type CubicBezier = readonly [number, number, number, number];

export function easingPath(
  [cp1x, cp1y, cp2x, cp2y]: CubicBezier,
  width: number,
  height: number,
): string {
  const x1 = cp1x * width;
  const y1 = (1 - cp1y) * height;
  const x2 = cp2x * width;
  const y2 = (1 - cp2y) * height;
  return `M 0 ${height} C ${x1} ${y1} ${x2} ${y2} ${width} 0`;
}
