/**
 * Whether a CMS string is a stub that should not render to the public site.
 * Editors leave `[CONFIRM: ...]` tokens in site-settings fields they have not
 * yet supplied; the site should render a graceful fallback instead of leaking
 * the raw token to visitors.
 */
export function isPlaceholder(value: string | null | undefined): boolean {
  if (!value) return true;
  return value.trim().startsWith("[CONFIRM:");
}
