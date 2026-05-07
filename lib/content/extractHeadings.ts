export type ExtractedHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

const HEADING_RE = /^(#{2,3})\s+(.+?)\s*$/gm;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function extractHeadings(
  source: string,
  levels: ReadonlyArray<2 | 3> = [2],
): ExtractedHeading[] {
  const headings: ExtractedHeading[] = [];
  for (const match of source.matchAll(HEADING_RE)) {
    const level = match[1].length as 2 | 3;
    if (!levels.includes(level)) continue;
    const text = match[2].replace(/\s*#+\s*$/, "").trim();
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}
