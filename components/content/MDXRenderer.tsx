import { MDXRemote } from "next-mdx-remote/rsc";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { Dropcap } from "@/components/content/Dropcap";
import { Marginalia } from "@/components/content/Marginalia";
import { PullQuote } from "@/components/content/PullQuote";
import { SceneBreak } from "@/components/content/SceneBreak";
import { Divider } from "@/components/ui/Divider";

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

function isExternal(href: string | undefined): boolean {
  if (!href) return false;
  return /^https?:\/\//.test(href);
}

function MDXAnchor({ href, children, ...rest }: AnchorProps) {
  const external = isExternal(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="text-accent underline underline-offset-4 transition hover:text-accent-2-text"
      {...rest}
    >
      {children}
    </a>
  );
}

const components = {
  h2: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h2 id={id} className="mt-12 mb-4 text-balance text-heading-3 text-ink">
      {children}
    </h2>
  ),
  h3: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h3 id={id} className="mt-8 mb-3 text-balance text-heading-4 text-ink">
      {children}
    </h3>
  ),
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="mt-6 mb-2 text-heading-5 text-ink">{children}</h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-5 text-body text-ink-2">{children}</p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-5 list-disc pl-6 text-body text-ink-2">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-5 list-decimal pl-6 text-body text-ink-2">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="my-2">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => <PullQuote>{children}</PullQuote>,
  hr: () => <Divider spacing="lg" />,
  a: MDXAnchor,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => <em className="italic">{children}</em>,
  code: ({ children }: { children?: ReactNode }) => (
    <code className="rounded bg-ground-3 px-1 py-0.5 font-mono text-body-sm text-ink">
      {children}
    </code>
  ),
  // R4.6 — author-callable editorial primitives.
  Dropcap,
  Marginalia,
  PullQuote,
  SceneBreak,
};

type MDXRendererProps = {
  source: string;
};

export function MDXRenderer({ source }: MDXRendererProps) {
  return (
    <MDXRemote
      source={source}
      components={components}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "append",
                properties: {
                  className: "heading-anchor",
                  ariaLabel: "Link to section",
                },
                content: {
                  type: "element",
                  tagName: "span",
                  properties: { ariaHidden: "true" },
                  children: [{ type: "text", value: "#" }],
                },
              },
            ],
          ],
        },
      }}
    />
  );
}
