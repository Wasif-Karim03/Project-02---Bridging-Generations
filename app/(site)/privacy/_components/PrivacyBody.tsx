import { MDXRenderer } from "@/components/content/MDXRenderer";

type PrivacyBodyProps = {
  source: string;
};

export function PrivacyBody({ source }: PrivacyBodyProps) {
  return (
    <article className="lg:max-w-[65ch]">
      <MDXRenderer source={source} />
    </article>
  );
}
