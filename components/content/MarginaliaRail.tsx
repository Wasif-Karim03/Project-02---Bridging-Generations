import type { ReactNode } from "react";
import { SharePost } from "@/components/content/SharePost";

type MarginaliaRailProps = {
  dateline?: string;
  authorName?: string;
  readTime?: string;
  shareTitle: string;
  shareUrl?: string;
  extra?: ReactNode;
};

export function MarginaliaRail({
  dateline,
  authorName,
  readTime,
  shareTitle,
  shareUrl,
  extra,
}: MarginaliaRailProps) {
  return (
    <aside className="marginalia-rail" aria-label="Article metadata">
      {dateline ? <span>{dateline}</span> : null}
      {authorName ? <span>By {authorName}</span> : null}
      {readTime ? <span>{readTime}</span> : null}
      {extra ?? null}
      <SharePost title={shareTitle} url={shareUrl} />
    </aside>
  );
}
