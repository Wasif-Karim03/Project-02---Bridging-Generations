import type { ReactNode } from "react";

type PullQuoteProps = {
  children?: ReactNode;
  quote?: string;
  cite?: ReactNode;
  className?: string;
};

export function PullQuote({ children, quote, cite, className }: PullQuoteProps) {
  const text = quote ?? children;
  return (
    <figure className={`pullquote ${className ?? ""}`.trim()}>
      <span className="pullquote__glyph" aria-hidden="true">
        “
      </span>
      <blockquote className="pullquote__quote text-balance">{text}</blockquote>
      {cite ? <figcaption className="pullquote__cite">{cite}</figcaption> : null}
    </figure>
  );
}
