// Next.js implements redirect() and notFound() by throwing a special error
// whose `digest` carries the intent. Server actions that wrap their whole body
// in try/catch (so a real failure returns a friendly message instead of hitting
// the global "Something went wrong" boundary) MUST re-throw these so navigation
// still works. This helper centralises that check.
export function isNextControlFlowError(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null | undefined)?.digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}
