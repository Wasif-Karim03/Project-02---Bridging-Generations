const WORDS_PER_MINUTE = 250;

export function readingTime(source: string): { minutes: number; label: string } {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { minutes, label: `${minutes} min read` };
}
