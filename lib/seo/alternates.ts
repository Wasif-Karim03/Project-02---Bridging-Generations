// Generates hreflang alternates for a public page.
// The site uses cookie-based locale switching with no /en/ /bn/ URL prefixes,
// so both locales point to the same URL. This is valid per Google's spec and
// correctly signals that Bengali content exists at each route.
export function pageAlternates(path: string) {
  return {
    canonical: path,
    languages: {
      en: path,
      bn: path,
      "x-default": path,
    } as Record<string, string>,
  };
}
