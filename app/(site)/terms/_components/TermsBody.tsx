import { MDXRenderer } from "@/components/content/MDXRenderer";

type TermsBodyProps = {
  source: string;
};

export function TermsBody({ source }: TermsBodyProps) {
  return (
    <article className="lg:max-w-[65ch]">
      <MDXRenderer source={source} />
    </article>
  );
}
