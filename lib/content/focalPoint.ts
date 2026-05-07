/**
 * Keystatic's `fields.object({ x: integer, y: integer })` types each integer as
 * `number | null`, but `MobileImage.mobileFocalPoint` (and CSS-var consumers
 * like `.mobile-fp`) expect `{ x: number; y: number } | null`. Coerce any
 * partial/null shape to the strict shape, falling back to null when either axis
 * is missing — defaults are applied at the consumer.
 */
export type MaybeFocalPoint = { x: number | null; y: number | null } | null | undefined;

export function toFocalPoint(fp: MaybeFocalPoint): { x: number; y: number } | null {
  return fp && fp.x != null && fp.y != null ? { x: fp.x, y: fp.y } : null;
}
