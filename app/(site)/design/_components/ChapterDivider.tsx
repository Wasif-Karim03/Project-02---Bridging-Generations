type Props = {
  index: string;
  label: string;
};

export function ChapterDivider({ index, label }: Props) {
  return (
    <div className="pt-24 pb-2 first:pt-4">
      <div className="flex items-baseline gap-5 border-t-2 border-ink pt-5">
        <span className="font-mono text-meta uppercase tracking-[0.2em] text-ink-2">{index}</span>
        <h2 className="text-heading-3 text-ink">{label}</h2>
      </div>
    </div>
  );
}
