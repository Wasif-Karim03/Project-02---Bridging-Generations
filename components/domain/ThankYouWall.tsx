import { MuseumWall } from "@/components/ui/editorial";

type ThankYouMessage = {
  message: string;
  year?: number | null;
  tier?: string;
};

type ThankYouWallProps = {
  messages: readonly ThankYouMessage[];
};

const TRUNCATE_LIMIT = 220;

function truncate(message: string): string {
  if (message.length <= TRUNCATE_LIMIT) return message;
  return `${message.slice(0, TRUNCATE_LIMIT - 1).trimEnd()}…`;
}

const TIER_LABEL: Record<string, string> = {
  founder: "Founder",
  patron: "Patron",
  friend: "Friend",
};

const TIER_ORDER = ["founder", "patron", "friend"] as const;

type Group = { key: string; label: string; messages: ThankYouMessage[] };

function buildGroups(messages: readonly ThankYouMessage[]): Group[] {
  const hasTier = messages.some((m) => m.tier && TIER_LABEL[m.tier]);
  if (hasTier) {
    const buckets = new Map<string, ThankYouMessage[]>();
    for (const tier of TIER_ORDER) buckets.set(tier, []);
    buckets.set("untiered", []);
    for (const m of messages) {
      const key = m.tier && TIER_LABEL[m.tier] ? m.tier : "untiered";
      buckets.get(key)?.push(m);
    }
    const groups: Group[] = [];
    for (const tier of TIER_ORDER) {
      const list = buckets.get(tier) ?? [];
      if (list.length > 0) groups.push({ key: tier, label: TIER_LABEL[tier], messages: list });
    }
    const untiered = buckets.get("untiered") ?? [];
    if (untiered.length > 0) {
      groups.push({ key: "untiered", label: "Friends of the work", messages: untiered });
    }
    return groups;
  }

  // No tier data — chronological monument by year (R4.8 fallback).
  const byYear = new Map<string, ThankYouMessage[]>();
  for (const m of messages) {
    const key = m.year ? String(m.year) : "undated";
    const bucket = byYear.get(key) ?? [];
    bucket.push(m);
    byYear.set(key, bucket);
  }
  const groups: Group[] = Array.from(byYear.entries())
    .map(([key, list]) => ({
      key,
      label: key === "undated" ? "Undated" : key,
      messages: list,
    }))
    .sort((a, b) => {
      if (a.key === "undated") return 1;
      if (b.key === "undated") return -1;
      return Number(b.key) - Number(a.key);
    });
  return groups;
}

/**
 * Anonymous thank-you wall, museum-roll typography. When any message has a
 * tier, the wall groups by Founder / Patron / Friend; otherwise it falls back
 * to chronological-by-year per R4.8 ("treat the wall as a chronological
 * monument" when no tier data). The first message in each group gets the
 * larger heading-5 weight so the column has internal scale.
 */
export function ThankYouWall({ messages }: ThankYouWallProps) {
  if (messages.length === 0) {
    return (
      <p className="text-body text-ink-2">No thank-you messages yet — yours could be the first.</p>
    );
  }
  const groups = buildGroups(messages);

  return (
    <MuseumWall ariaLabel="Anonymous thank-you wall">
      {groups.map((group) => (
        <div key={group.key} className="break-inside-avoid">
          <MuseumWall.Tier label={group.label} count={group.messages.length} scale="lg" />
          <ul className="mt-4 flex flex-col gap-5">
            {group.messages.map((m, i) => (
              <li key={`${group.key}-${m.message.slice(0, 32)}`} className="flex flex-col gap-1">
                <p
                  className={
                    i === 0
                      ? "text-balance text-heading-5 text-ink"
                      : "text-balance text-body text-ink"
                  }
                >
                  {truncate(m.message)}
                </p>
                <p className="text-meta uppercase tracking-[0.08em] text-ink-2">
                  Anonymous{m.year ? ` · ${m.year}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </MuseumWall>
  );
}
